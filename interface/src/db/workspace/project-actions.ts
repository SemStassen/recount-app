import { Project, ProjectModule, Task } from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { WorkspaceId } from "@recount/core/shared/schemas";
import { ProjectId, TaskId } from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import type { ElectricCollectionUtils } from "@tanstack/electric-db-collection";
import type { Collection } from "@tanstack/react-db";
import { createTransaction } from "@tanstack/react-db";
import { Effect, ManagedRuntime, Option } from "effect";

import { BackendHttpApiClient } from "~/lib/api/client";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

import { awaitCollectionChanges } from "./electric-reconciliation";
import { runOptimisticWorkspaceAction } from "./optimistic-workspace-action";

type ElectricCollection = Collection<
  any,
  any,
  ElectricCollectionUtils<any>,
  any,
  any
>;

type ProjectActionsRuntime = ManagedRuntime.ManagedRuntime<
  ProjectModule | BackendAtomRpcClient | BackendHttpApiClient,
  never
>;

interface CreateProjectActionsParams {
  readonly workspaceId: WorkspaceId;
  readonly workspaceRuntime: ProjectActionsRuntime;
  readonly allProjectsCollection: ElectricCollection;
  readonly allTasksCollection: ElectricCollection;
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

    return runOptimisticWorkspaceAction<
      Project,
      { readonly id: Project["id"]; readonly project: Project | undefined },
      ReadonlyArray<Project>,
      {
        readonly id: Project["id"];
        readonly project: Project | undefined;
        readonly transaction: ReturnType<typeof createTransaction<Project>>;
      }
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

        return { id, project };
      },
      persistRemote: async ({ transaction }) =>
        Promise.all(
          transaction.mutations.map(({ modified }) =>
            params.workspaceRuntime.runPromise(
              Effect.gen(function* () {
                const client = yield* BackendAtomRpcClient;

                return yield* client(
                  "Project.Create",
                  {
                    id: Option.some(modified.id),
                    name: modified.name,
                    color: modified.color,
                    isBillable: modified.isBillable,
                    notes: modified.notes,
                  },
                  {
                    headers: {
                      [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                    },
                  }
                );
              })
            )
          )
        ),
      awaitRemoteSync: ({ remoteResult }) =>
        awaitCollectionChanges({
          collection: params.allProjectsCollection,
          operation: "insert",
          ids: remoteResult.map((project) => project.id),
        }).then(() => {}),
      toSuccess: ({ accepted, transaction }) => ({
        id: accepted.id,
        project: accepted.project,
        transaction,
      }),
    });
  };

  const updateProject = (
    id: Project["id"],
    data: typeof Project.jsonUpdate.Type
  ) =>
    runOptimisticWorkspaceAction<
      Project,
      { readonly project: Project | undefined },
      ReadonlyArray<Project>,
      {
        readonly project: Project | undefined;
        readonly transaction: ReturnType<typeof createTransaction<Project>>;
      }
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

        return { project };
      },
      persistRemote: async ({ transaction }) =>
        Promise.all(
          transaction.mutations.map(({ changes, original }) => {
            const project = original as Project;

            return params.workspaceRuntime.runPromise(
              Effect.gen(function* () {
                const client = yield* BackendAtomRpcClient;

                return yield* client(
                  "Project.Update",
                  {
                    id: project.id,
                    data: changes,
                  },
                  {
                    headers: {
                      [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                    },
                  }
                );
              })
            );
          })
        ),
      awaitRemoteSync: ({ remoteResult }) =>
        awaitCollectionChanges({
          collection: params.allProjectsCollection,
          operation: "update",
          ids: remoteResult.map((project) => project.id),
        }).then(() => {}),
      toSuccess: ({ accepted, transaction }) => ({
        project: accepted.project,
        transaction,
      }),
    });

  const createTask = (payload: typeof Task.jsonCreate.Type) => {
    const id = Option.getOrElse(payload.id, () => TaskId.make(generateUUID()));
    const data = {
      ...payload,
      id: Option.some(id),
    };

    return runOptimisticWorkspaceAction<
      Task,
      { readonly id: Task["id"]; readonly task: Task | undefined },
      ReadonlyArray<Task>,
      {
        readonly id: Task["id"];
        readonly task: Task | undefined;
        readonly transaction: ReturnType<typeof createTransaction<Task>>;
      }
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

        return { id, task };
      },
      persistRemote: async ({ transaction }) =>
        Promise.all(
          transaction.mutations.map(({ modified }) =>
            params.workspaceRuntime.runPromise(
              Effect.gen(function* () {
                const client = yield* BackendAtomRpcClient;

                return yield* client(
                  "Task.Create",
                  {
                    id: Option.some(modified.id),
                    projectId: modified.projectId,
                    name: modified.name,
                  },
                  {
                    headers: {
                      [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                    },
                  }
                );
              })
            )
          )
        ),
      awaitRemoteSync: ({ remoteResult }) =>
        awaitCollectionChanges({
          collection: params.allTasksCollection,
          operation: "insert",
          ids: remoteResult.map((task) => task.id),
        }).then(() => {}),
      toSuccess: ({ accepted, transaction }) => ({
        id: accepted.id,
        task: accepted.task,
        transaction,
      }),
    });
  };

  const updateTask = (id: Task["id"], data: typeof Task.jsonUpdate.Type) =>
    runOptimisticWorkspaceAction<
      Task,
      { readonly task: Task | undefined },
      ReadonlyArray<Task>,
      {
        readonly task: Task | undefined;
        readonly transaction: ReturnType<typeof createTransaction<Task>>;
      }
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

        return { task };
      },
      persistRemote: async ({ transaction }) =>
        Promise.all(
          transaction.mutations.map(({ changes, original }) => {
            const task = original as Task;

            return params.workspaceRuntime.runPromise(
              Effect.gen(function* () {
                const client = yield* BackendAtomRpcClient;

                return yield* client(
                  "Task.Update",
                  {
                    id: task.id,
                    data: changes,
                  },
                  {
                    headers: {
                      [WORKSPACE_ID_HEADER]: workspaceIdHeader,
                    },
                  }
                );
              })
            );
          })
        ),
      awaitRemoteSync: ({ remoteResult }) =>
        awaitCollectionChanges({
          collection: params.allTasksCollection,
          operation: "update",
          ids: remoteResult.map((task) => task.id),
        }).then(() => {}),
      toSuccess: ({ accepted, transaction }) => ({
        task: accepted.task,
        transaction,
      }),
    });

  return {
    createProject,
    createTask,
    updateProject,
    updateTask,
  };
}
