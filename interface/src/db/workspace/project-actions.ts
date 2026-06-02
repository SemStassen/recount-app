import { Project, ProjectModule, Task } from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { WorkspaceId } from "@recount/core/shared/schemas";
import { ProjectId, TaskId } from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { Effect, ManagedRuntime, Option } from "effect";

import { BackendHttpApiClient } from "~/lib/api/client";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

import type { ReconciledCollection } from "./electric-reconciliation";
import { runSyncedWorkspaceAction } from "./optimistic-workspace-action";

type ProjectActionsRuntime = ManagedRuntime.ManagedRuntime<
  ProjectModule | BackendAtomRpcClient | BackendHttpApiClient,
  never
>;

interface CreateProjectActionsParams {
  readonly workspaceId: WorkspaceId;
  readonly workspaceRuntime: ProjectActionsRuntime;
  readonly allProjectsCollection: ReconciledCollection;
  readonly allTasksCollection: ReconciledCollection;
}

export function createProjectActions(params: CreateProjectActionsParams) {
  const workspaceIdHeader = params.workspaceId;

  const createProject = (payload: typeof Project.jsonCreate.Type) => {
    const id = Option.getOrElse(payload.id, () =>
      ProjectId.make(generateUUID())
    );
    const data = {
      ...payload,
      id: Option.some(id),
    };

    return runSyncedWorkspaceAction<
      Project,
      Project,
      Project
    >({
      mutateLocal: () => {
        const project = params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            const [project] = yield* projectModule.createProjects({
              workspaceId: params.workspaceId,
              data: [data],
            });

            return project;
          })
        );

        if (!project) {
          throw new Error("Project was not created in local state");
        }

        return project;
      },
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Project.Create",
              data,
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: {
        collection: params.allProjectsCollection,
        operation: "insert",
        getIds: (remoteResult) => [remoteResult.id],
      },
    });
  };

  const updateProject = (
    id: Project["id"],
    data: typeof Project.jsonUpdate.Type
  ) =>
    runSyncedWorkspaceAction<
      Project,
      Project,
      Project
    >({
      mutateLocal: () => {
        const project = params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            return yield* projectModule.updateProject({
              workspaceId: params.workspaceId,
              id,
              data,
            });
          })
        );

        return project;
      },
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Project.Update",
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
      remoteSync: {
        collection: params.allProjectsCollection,
        operation: "update",
        getIds: (remoteResult) => [remoteResult.id],
      },
    });

  const createTask = (payload: typeof Task.jsonCreate.Type) => {
    const id = Option.getOrElse(payload.id, () => TaskId.make(generateUUID()));
    const data = {
      ...payload,
      id: Option.some(id),
    };

    return runSyncedWorkspaceAction<
      Task,
      Task,
      Task
    >({
      mutateLocal: () => {
        const task = params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            const [task] = yield* projectModule.createTasks({
              workspaceId: params.workspaceId,
              data: [data],
            });

            return task;
          })
        );

        if (!task) {
          throw new Error("Task was not created in local state");
        }

        return task;
      },
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Task.Create",
              data,
              {
                headers: {
                  [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                },
              }
            );
          })
        ),
      remoteSync: {
        collection: params.allTasksCollection,
        operation: "insert",
        getIds: (remoteResult) => [remoteResult.id],
      },
    });
  };

  const updateTask = (id: Task["id"], data: typeof Task.jsonUpdate.Type) =>
    runSyncedWorkspaceAction<
      Task,
      Task,
      Task
    >({
      mutateLocal: () => {
        const task = params.workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            return yield* projectModule.updateTask({
              workspaceId: params.workspaceId,
              id,
              data,
            });
          })
        );

        return task;
      },
      persistRemote: async () =>
        params.workspaceRuntime.runPromise(
          Effect.gen(function* () {
            const client = yield* BackendAtomRpcClient;

            return yield* client(
              "Task.Update",
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
      remoteSync: {
        collection: params.allTasksCollection,
        operation: "update",
        getIds: (remoteResult) => [remoteResult.id],
      },
    });

  return {
    createProject,
    createTask,
    updateProject,
    updateTask,
  };
}
