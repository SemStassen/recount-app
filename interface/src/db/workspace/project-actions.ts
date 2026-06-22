import type { Project, Task } from "@recount/core/modules/project";
import { ProjectModule } from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { WorkspaceId } from "@recount/core/shared/schemas";
import { ProjectId, TaskId } from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { Effect } from "effect";

import type { ReconciledCollection } from "~/db/synced-collections";
import { insertedRecords, updatedRecords } from "~/db/synced-collections";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

import { runElectricReconciledWorkspaceAction } from "./optimistic-workspace-action";
import type { WorkspaceRuntime } from "./workspace-runtime";

interface CreateProjectActionsParams {
  readonly workspaceId: WorkspaceId;
  readonly workspaceRuntime: WorkspaceRuntime;
  readonly allProjectsCollection: ReconciledCollection;
  readonly allTasksCollection: ReconciledCollection;
}

export function createProjectActions(params: CreateProjectActionsParams) {
  const workspaceIdHeader = params.workspaceId;

  const archiveProject = (id: Project["id"]) =>
    runElectricReconciledWorkspaceAction({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            yield* projectModule.archiveProject({
              id,
              workspaceId: params.workspaceId,
            });
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Project.Archive",
              { id },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: updatedRecords({
        collection: params.allProjectsCollection,
        getIds: () => [id],
      }),
    });

  const createProject = (payload: typeof Project.jsonCreate.Type) => {
    const id = payload.id ?? ProjectId.make(generateUUID());
    const data = {
      ...payload,
      id,
    };

    return runElectricReconciledWorkspaceAction<Project, Project>({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            const [project] = yield* projectModule.createProjects({
              data: [data],
              workspaceId: params.workspaceId,
            });

            if (!project) {
              return yield* Effect.die(
                "Project was not created in local state"
              );
            }

            return project;
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client("Project.Create", data, {
              headers: {
                [WORKSPACE_ID_HEADER]: workspaceIdHeader,
              },
            });
          })
        ),
      remoteSync: insertedRecords({
        collection: params.allProjectsCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });
  };

  const updateProject = (
    id: Project["id"],
    data: typeof Project.jsonUpdate.Type
  ) =>
    runElectricReconciledWorkspaceAction<Project, Project>({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            return yield* projectModule.updateProject({
              data,
              id,
              workspaceId: params.workspaceId,
            });
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Project.Update",
              {
                data,
                id,
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
        collection: params.allProjectsCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });

  const unarchiveProject = (id: Project["id"]) =>
    runElectricReconciledWorkspaceAction({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            yield* projectModule.unarchiveProject({
              id,
              workspaceId: params.workspaceId,
            });
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Project.Unarchive",
              { id },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: updatedRecords({
        collection: params.allProjectsCollection,
        getIds: () => [id],
      }),
    });

  const createTask = (payload: typeof Task.jsonCreate.Type) => {
    const id = payload.id ?? TaskId.make(generateUUID());
    const data = {
      ...payload,
      id,
    };
    const command = {
      ...payload,
      id,
    };

    return runElectricReconciledWorkspaceAction<Task, Task>({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            const [task] = yield* projectModule.createTasks({
              data: [data],
              workspaceId: params.workspaceId,
            });

            if (!task) {
              return yield* Effect.die("Task was not created in local state");
            }

            return task;
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client("Task.Create", command, {
              headers: {
                [WORKSPACE_ID_HEADER]: workspaceIdHeader,
              },
            });
          })
        ),
      remoteSync: insertedRecords({
        collection: params.allTasksCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });
  };

  const updateTask = (id: Task["id"], data: typeof Task.jsonUpdate.Type) =>
    runElectricReconciledWorkspaceAction<Task, Task>({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            return yield* projectModule.updateTask({
              data,
              id,
              workspaceId: params.workspaceId,
            });
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Task.Update",
              {
                data,
                id,
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
        collection: params.allTasksCollection,
        getIds: (remoteResult) => [remoteResult.id],
      }),
    });

  const archiveTask = (id: Task["id"]) =>
    runElectricReconciledWorkspaceAction({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            yield* projectModule.archiveTask({
              id,
              workspaceId: params.workspaceId,
            });
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Task.Archive",
              { id },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: updatedRecords({
        collection: params.allTasksCollection,
        getIds: () => [id],
      }),
    });

  const unarchiveTask = (id: Task["id"]) =>
    runElectricReconciledWorkspaceAction({
      mutateLocal: () =>
        params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            yield* projectModule.unarchiveTask({
              id,
              workspaceId: params.workspaceId,
            });
          })
        ),
      persistRemote: () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Task.Unarchive",
              { id },
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: updatedRecords({
        collection: params.allTasksCollection,
        getIds: () => [id],
      }),
    });

  return {
    archiveProject,
    archiveTask,
    createProject,
    createTask,
    unarchiveProject,
    unarchiveTask,
    updateProject,
    updateTask,
  };
}
