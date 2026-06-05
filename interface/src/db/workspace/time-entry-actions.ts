import { Timer, TimeEntry, TimeModule } from "@recount/core/modules/time";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { UserId, WorkspaceId } from "@recount/core/shared/schemas";
import { TimerId, TimeEntryId } from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { DateTime, Effect, Option } from "effect";

import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

import {
  deletedRecords,
  insertedRecords,
  type ReconciledCollection,
  updatedRecords,
} from "./electric-reconciliation";
import { runSyncedWorkspaceAction } from "./optimistic-workspace-action";
import type { WorkspaceRuntime } from "./workspace-runtime";

type WorkspaceMemberCollection = {
  values: () => Iterable<typeof WorkspaceMember.json.Type>;
};

type TimeEntryResult = typeof TimeEntry.json.Type;

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
    runSyncedWorkspaceAction<void, void>({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            yield* timeModule.hardDeleteTimeEntries({
              workspaceId: params.workspaceId,
              ids: [id],
            });
          })
        ),
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "TimeEntry.Delete",
              { timeEntryId: id },
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
    const id = Option.getOrElse(payload.id, () =>
      TimeEntryId.make(generateUUID())
    );
    const data = {
      ...payload,
      id: Option.some(id),
    };

    return runSyncedWorkspaceAction<TimeEntryResult, TimeEntry>({
      mutateLocal: () => {
        const workspaceMember = getCurrentWorkspaceMember({
          userId: params.userId,
          workspaceMembersCollection: params.workspaceMembersCollection,
        });
        const timeEntry = params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;
            const [createdTimeEntry] = yield* timeModule.createTimeEntries({
              workspaceId: params.workspaceId,
              workspaceMemberId: workspaceMember.id,
              data: [data],
            });

            return createdTimeEntry;
          })
        );

        if (!timeEntry) {
          throw new Error("Time entry was not created in local state");
        }

        return timeEntry;
      },
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            const startedAt = data.startedAt ?? (yield* DateTime.now);

            return yield* client(
              "TimeEntry.Create",
              {
                id: data.id,
                projectId: data.projectId,
                taskId: data.taskId ?? Option.none(),
                startedAt,
                stoppedAt: data.stoppedAt,
                notes: data.notes ?? Option.none(),
              },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: insertedRecords({
        collection: params.timeEntriesCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });
  };

  const startTimer = (payload: typeof Timer.jsonCreate.Type) => {
    const id = Option.getOrElse(payload.id, () => TimerId.make(generateUUID()));
    const startedAt = params.workspaceRuntime.runSync(DateTime.now);
    const data = {
      ...payload,
      id: Option.some(id),
    };

    return runSyncedWorkspaceAction<Timer, Timer>({
      mutateLocal: () => {
        const workspaceMember = getCurrentWorkspaceMember({
          userId: params.userId,
          workspaceMembersCollection: params.workspaceMembersCollection,
        });

        return params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            return yield* timeModule.startTimer({
              workspaceId: params.workspaceId,
              workspaceMemberId: workspaceMember.id,
              data,
              startedAt,
            });
          })
        );
      },
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Timer.Start",
              {
                id: data.id,
                projectId: data.projectId,
                taskId: data.taskId ?? Option.none(),
                notes: data.notes ?? Option.none(),
                startedAt,
              },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: insertedRecords({
        collection: params.timeEntriesCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });
  };

  const updateTimer = (data: typeof Timer.jsonUpdate.Type) =>
    runSyncedWorkspaceAction<Timer, Timer>({
      mutateLocal: () => {
        const workspaceMember = getCurrentWorkspaceMember({
          userId: params.userId,
          workspaceMembersCollection: params.workspaceMembersCollection,
        });

        return params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            return yield* timeModule.updateTimer({
              workspaceId: params.workspaceId,
              workspaceMemberId: workspaceMember.id,
              data,
            });
          })
        );
      },
      persistRemote: async () =>
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

    return runSyncedWorkspaceAction<TimeEntryResult, TimeEntryResult>({
      mutateLocal: () => {
        const workspaceMember = getCurrentWorkspaceMember({
          userId: params.userId,
          workspaceMembersCollection: params.workspaceMembersCollection,
        });

        return params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const timeModule = yield* TimeModule;

            return yield* timeModule.stopTimer({
              workspaceId: params.workspaceId,
              workspaceMemberId: workspaceMember.id,
              stoppedAt,
            });
          })
        );
      },
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client("Timer.Stop", { stoppedAt }, {
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
  };

  const updateTimeEntry = (
    id: TimeEntry["id"],
    data: typeof TimeEntry.jsonUpdate.Type
  ) =>
    runSyncedWorkspaceAction<TimeEntryResult, TimeEntryResult>({
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
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "TimeEntry.Update",
              {
                timeEntryId: id,
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
