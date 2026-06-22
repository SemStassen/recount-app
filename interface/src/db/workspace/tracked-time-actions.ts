import type { Timer, TimeEntry } from "@recount/core/modules/time";
import { TimeModule } from "@recount/core/modules/time";
import type {
  CreateTimeEntryRpcCommand,
  StartTimerRpcCommand,
} from "@recount/core/modules/time/api";
import type { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { UserId, WorkspaceId } from "@recount/core/shared/schemas";
import { TimerId, TimeEntryId } from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { DateTime, Effect } from "effect";

import type { ReconciledCollection } from "~/db/synced-collections";
import {
  deletedRecords,
  insertedRecords,
  updatedRecords,
} from "~/db/synced-collections";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

import { runElectricReconciledWorkspaceAction } from "./optimistic-workspace-action";
import type { WorkspaceRuntime } from "./workspace-runtime";

interface WorkspaceMemberCollection {
  values: () => Iterable<typeof WorkspaceMember.json.Type>;
}

interface CreateTimeEntryActionsParams {
  readonly userId: UserId;
  readonly workspaceId: WorkspaceId;
  readonly workspaceRuntime: WorkspaceRuntime;
  readonly workspaceMembersCollection: WorkspaceMemberCollection;
  readonly timeEntriesCollection: ReconciledCollection;
}

const getCurrentWorkspaceMember = (params: {
  readonly userId: UserId;
  readonly workspaceMembersCollection: WorkspaceMemberCollection;
}) => {
  for (const workspaceMember of params.workspaceMembersCollection.values()) {
    if (workspaceMember.userId === params.userId) {
      return workspaceMember;
    }
  }

  throw new Error("Current workspace member was not found in local state");
};

export function createTimeEntryActions(params: CreateTimeEntryActionsParams) {
  const workspaceIdHeader = params.workspaceId;

  const deleteTimeEntry = (id: TimeEntry["id"]) =>
    runElectricReconciledWorkspaceAction({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            yield* timeModule.hardDeleteTimeEntries({
              ids: [id],
              workspaceId: params.workspaceId,
            });
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "TimeEntry.Delete",
              { id },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: deletedRecords({
        collection: params.timeEntriesCollection,
        getIds: () => [id],
      }),
    });

  const createTimeEntry = (payload: typeof TimeEntry.jsonCreate.Type) => {
    const command: typeof CreateTimeEntryRpcCommand.Type = {
      ...payload,
      id: payload.id ?? TimeEntryId.make(generateUUID()),
    };

    return runElectricReconciledWorkspaceAction<TimeEntry, TimeEntry>({
      mutateLocal: () => {
        const workspaceMember = getCurrentWorkspaceMember({
          userId: params.userId,
          workspaceMembersCollection: params.workspaceMembersCollection,
        });

        const timeEntry = params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;
            const [createdTimeEntry] = yield* timeModule.createTimeEntries({
              data: [command],
              workspaceId: params.workspaceId,
              workspaceMemberId: workspaceMember.id,
            });

            return createdTimeEntry;
          })
        );

        if (!timeEntry) {
          throw new Error("Time entry was not created in local state");
        }

        return timeEntry;
      },
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client("TimeEntry.Create", command, {
              headers: {
                [WORKSPACE_ID_HEADER]: workspaceIdHeader,
              },
            });
          })
        ),
      remoteSync: insertedRecords({
        collection: params.timeEntriesCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });
  };

  const startTimer = (payload: typeof Timer.jsonCreate.Type) => {
    const startedAt = params.workspaceRuntime.runSync(DateTime.now);
    const command: typeof StartTimerRpcCommand.Type = {
      ...payload,
      id: payload.id ?? TimerId.make(generateUUID()),
      startedAt,
    };

    return runElectricReconciledWorkspaceAction<Timer, Timer>({
      mutateLocal: () => {
        const workspaceMember = getCurrentWorkspaceMember({
          userId: params.userId,
          workspaceMembersCollection: params.workspaceMembersCollection,
        });

        return params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            return yield* timeModule.startTimer({
              data: command,
              workspaceId: params.workspaceId,
              workspaceMemberId: workspaceMember.id,
            });
          })
        );
      },
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client("Timer.Start", command, {
              headers: {
                [WORKSPACE_ID_HEADER]: workspaceIdHeader,
              },
            });
          })
        ),
      remoteSync: insertedRecords({
        collection: params.timeEntriesCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });
  };

  const updateTimer = (data: typeof Timer.jsonUpdate.Type) =>
    runElectricReconciledWorkspaceAction<Timer, Timer>({
      mutateLocal: () => {
        const workspaceMember = getCurrentWorkspaceMember({
          userId: params.userId,
          workspaceMembersCollection: params.workspaceMembersCollection,
        });

        return params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            return yield* timeModule.updateTimer({
              data,
              workspaceId: params.workspaceId,
              workspaceMemberId: workspaceMember.id,
            });
          })
        );
      },
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client("Timer.Update", data, {
              headers: {
                [WORKSPACE_ID_HEADER]: workspaceIdHeader,
              },
            });
          })
        ),
      remoteSync: updatedRecords({
        collection: params.timeEntriesCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });

  const stopTimer = () => {
    const stoppedAt = params.workspaceRuntime.runSync(DateTime.now);

    return runElectricReconciledWorkspaceAction<TimeEntry, TimeEntry>({
      mutateLocal: () => {
        const workspaceMember = getCurrentWorkspaceMember({
          userId: params.userId,
          workspaceMembersCollection: params.workspaceMembersCollection,
        });

        return params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            return yield* timeModule.stopTimer({
              data: { stoppedAt },
              workspaceId: params.workspaceId,
              workspaceMemberId: workspaceMember.id,
            });
          })
        );
      },
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Timer.Stop",
              { stoppedAt },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: updatedRecords({
        collection: params.timeEntriesCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });
  };

  const updateTimeEntry = (
    id: TimeEntry["id"],
    data: typeof TimeEntry.jsonUpdate.Type
  ) =>
    runElectricReconciledWorkspaceAction<TimeEntry, TimeEntry>({
      mutateLocal: () => {
        const timeEntry = params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            return yield* timeModule.updateTimeEntry({
              workspaceId: params.workspaceId,
              id,
              data,
            });
          })
        );

        return timeEntry;
      },
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "TimeEntry.Update",
              {
                id,
                data,
              },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: updatedRecords({
        collection: params.timeEntriesCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });

  return {
    createTimeEntry,
    deleteTimeEntry,
    startTimer,
    stopTimer,
    updateTimeEntry,
    updateTimer,
  };
}
