import { snakeCamelMapper } from "@electric-sql/client";
import {
  Project,
  ProjectModule,
  ProjectModuleLayer,
  Task,
} from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { ProjectId, TaskId, WorkspaceId } from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { isChangeMessage } from "@tanstack/electric-db-collection";
import {
  createCollection,
  createLiveQueryCollection,
  createTransaction,
  eq,
  not,
} from "@tanstack/react-db";
import { Effect, Exit, Layer, ManagedRuntime, Option } from "effect";

import { authFetch } from "~/lib/auth";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";
import { appRuntimeLayer } from "~/lib/runtime";
import { createClientProjectRepositoryLayer } from "~/lib/services/client-project-repository.layer";
import { createClientTaskRepositoryLayer } from "~/lib/services/client-task-repository.layer";

import { workspaceShapes } from "../sync-shapes";

export type WorkspaceDb = Awaited<ReturnType<typeof openWorkspaceDb>>;

const fetchWithPreconnect = fetch as typeof fetch & {
  preconnect?: typeof fetch;
};

export async function openWorkspaceDb(workspaceId: string) {
  const abortController = new AbortController();
  const workspaceFetchClient: typeof fetch = Object.assign(
    (url: RequestInfo | URL, options?: RequestInit) =>
      authFetch(url, {
        ...options,
        cache: "no-store",
        headers: {
          ...options?.headers,
          [WORKSPACE_ID_HEADER]: workspaceId,
        },
      }),
    {
      preconnect: fetchWithPreconnect.preconnect?.bind(fetch),
    }
  );

  const createCollectionId = (collectionId: string) =>
    `workspace:${workspaceId}:${collectionId}`;
  const brandedWorkspaceId = WorkspaceId.make(workspaceId);

  const workspaceMembersCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(workspaceShapes.workspaceMembers.name),
      schema: workspaceShapes.workspaceMembers.schema,
      getKey: workspaceShapes.workspaceMembers.getKey,
      shapeOptions: {
        url: workspaceShapes.workspaceMembers.url,
        columnMapper: snakeCamelMapper(),
        transformer: workspaceShapes.workspaceMembers.decodeRow,
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
      },
    })
  );

  const workspaceIntegrationConnectionsCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(
        workspaceShapes.workspaceIntegrationConnections.name
      ),
      schema: workspaceShapes.workspaceIntegrationConnections.schema,
      getKey: workspaceShapes.workspaceIntegrationConnections.getKey,
      shapeOptions: {
        url: workspaceShapes.workspaceIntegrationConnections.url,
        columnMapper: snakeCamelMapper(),
        transformer: workspaceShapes.workspaceIntegrationConnections.decodeRow,
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
      },
    })
  );

  const allProjectsCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(workspaceShapes.projects.name),
      schema: workspaceShapes.projects.schema,
      getKey: workspaceShapes.projects.getKey,
      shapeOptions: {
        url: workspaceShapes.projects.url,
        columnMapper: snakeCamelMapper(),
        transformer: workspaceShapes.projects.decodeRow,
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
      },
    })
  );

  const activeProjectsCollection = createLiveQueryCollection((q) =>
    q
      .from({ p: allProjectsCollection })
      .where(({ p }) => eq(p.archivedAt, Option.none()))
  );

  const archivedProjectsCollection = createLiveQueryCollection((q) =>
    q
      .from({ p: allProjectsCollection })
      .where(({ p }) => not(eq(p.archivedAt, Option.none())))
  );

  const allTasksCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(workspaceShapes.tasks.name),
      schema: workspaceShapes.tasks.schema,
      getKey: workspaceShapes.tasks.getKey,
      shapeOptions: {
        url: workspaceShapes.tasks.url,
        columnMapper: snakeCamelMapper(),
        transformer: workspaceShapes.tasks.decodeRow,
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
      },
    })
  );

  const activeTasksCollection = createLiveQueryCollection((q) =>
    q
      .from({ t: allTasksCollection })
      .where(({ t }) => eq(t.archivedAt, Option.none()))
  );

  const archivedTasksCollection = createLiveQueryCollection((q) =>
    q
      .from({ t: allTasksCollection })
      .where(({ t }) => not(eq(t.archivedAt, Option.none())))
  );

  const timeEntriesCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId(workspaceShapes.timeEntries.name),
      schema: workspaceShapes.timeEntries.schema,
      getKey: workspaceShapes.timeEntries.getKey,
      shapeOptions: {
        url: workspaceShapes.timeEntries.url,
        columnMapper: snakeCamelMapper(),
        transformer: workspaceShapes.timeEntries.decodeRow,
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
      },
    })
  );

  const projectRepositoryLayer = createClientProjectRepositoryLayer(
    allProjectsCollection
  );
  const taskRepositoryLayer =
    createClientTaskRepositoryLayer(allTasksCollection);
  const workspaceRuntime = ManagedRuntime.make(
    Layer.mergeAll(
      appRuntimeLayer,
      ProjectModuleLayer.pipe(
        Layer.provide(projectRepositoryLayer),
        Layer.provide(taskRepositoryLayer)
      )
    )
  );

  const createProject = (payload: typeof Project.jsonCreate.Type) => {
    const id = Option.getOrElse(payload.id, () =>
      ProjectId.make(generateUUID())
    );
    const data = {
      ...payload,
      id: Option.some(id),
    };
    let acceptedProject: Project | undefined;
    const transaction = createTransaction<Project>({
      mutationFn: async ({ transaction }) => {
        const createdProjects = await Promise.all(
          transaction.mutations.map(({ modified }) =>
            workspaceRuntime.runPromise(
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
                      [WORKSPACE_ID_HEADER]: workspaceId,
                    },
                  }
                );
              })
            )
          )
        );

        await Promise.all(
          createdProjects.map((createdProject) =>
            allProjectsCollection.utils.awaitMatch(
              (message) =>
                isChangeMessage(message) &&
                message.headers.operation === "insert" &&
                message.value.id === createdProject.id
            )
          )
        );
      },
    });

    try {
      transaction.mutate(() => {
        acceptedProject = workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            const [project] = yield* projectModule.createProjects({
              workspaceId: brandedWorkspaceId,
              data: [data],
            });

            return project;
          })
        );
      });

      return Exit.succeed({
        id,
        project: acceptedProject,
        transaction,
      });
    } catch (cause) {
      return Exit.fail(cause);
    }
  };

  const updateProject = (
    id: Project["id"],
    data: typeof Project.jsonUpdate.Type
  ) => {
    let acceptedProject: Project | undefined;
    const transaction = createTransaction<Project>({
      mutationFn: async ({ transaction }) => {
        const updatedProjects = await Promise.all(
          transaction.mutations.map(({ changes, original }) => {
            const project = original as Project;

            return workspaceRuntime.runPromise(
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
                      [WORKSPACE_ID_HEADER]: workspaceId,
                    },
                  }
                );
              })
            );
          })
        );

        await Promise.all(
          updatedProjects.map((updatedProject) =>
            allProjectsCollection.utils.awaitMatch(
              (message) =>
                isChangeMessage(message) &&
                message.headers.operation === "update" &&
                message.value.id === updatedProject.id
            )
          )
        );
      },
    });

    try {
      transaction.mutate(() => {
        acceptedProject = workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            return yield* projectModule.updateProject({
              workspaceId: brandedWorkspaceId,
              id,
              data,
            });
          })
        );
      });

      return Exit.succeed({
        project: acceptedProject,
        transaction,
      });
    } catch (cause) {
      return Exit.fail(cause);
    }
  };

  const createTask = (payload: typeof Task.jsonCreate.Type) => {
    const id = Option.getOrElse(payload.id, () => TaskId.make(generateUUID()));
    const data = {
      ...payload,
      id: Option.some(id),
    };
    let acceptedTask: Task | undefined;
    const transaction = createTransaction<Task>({
      mutationFn: async ({ transaction }) => {
        const createdTasks = await Promise.all(
          transaction.mutations.map(({ modified }) =>
            workspaceRuntime.runPromise(
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
                      [WORKSPACE_ID_HEADER]: workspaceId,
                    },
                  }
                );
              })
            )
          )
        );

        await Promise.all(
          createdTasks.map((createdTask) =>
            allTasksCollection.utils.awaitMatch(
              (message) =>
                isChangeMessage(message) &&
                message.headers.operation === "insert" &&
                message.value.id === createdTask.id
            )
          )
        );
      },
    });

    try {
      transaction.mutate(() => {
        acceptedTask = workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            const [task] = yield* projectModule.createTasks({
              workspaceId: brandedWorkspaceId,
              data: [data],
            });

            return task;
          })
        );
      });

      return Exit.succeed({
        id,
        task: acceptedTask,
        transaction,
      });
    } catch (cause) {
      return Exit.fail(cause);
    }
  };

  const updateTask = (id: Task["id"], data: typeof Task.jsonUpdate.Type) => {
    let acceptedTask: Task | undefined;
    const transaction = createTransaction<Task>({
      mutationFn: async ({ transaction }) => {
        const updatedTasks = await Promise.all(
          transaction.mutations.map(({ changes, original }) => {
            const task = original as Task;

            return workspaceRuntime.runPromise(
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
                      [WORKSPACE_ID_HEADER]: workspaceId,
                    },
                  }
                );
              })
            );
          })
        );

        await Promise.all(
          updatedTasks.map((updatedTask) =>
            allTasksCollection.utils.awaitMatch(
              (message) =>
                isChangeMessage(message) &&
                message.headers.operation === "update" &&
                message.value.id === updatedTask.id
            )
          )
        );
      },
    });

    try {
      transaction.mutate(() => {
        acceptedTask = workspaceRuntime.runSync(
          Effect.gen(function* () {
            const projectModule = yield* ProjectModule;

            return yield* projectModule.updateTask({
              workspaceId: brandedWorkspaceId,
              id,
              data,
            });
          })
        );
      });

      return Exit.succeed({
        task: acceptedTask,
        transaction,
      });
    } catch (cause) {
      return Exit.fail(cause);
    }
  };

  let preloadPromise: Promise<void> | null = null;

  return {
    actions: {
      createProject,
      createTask,
      updateProject,
      updateTask,
    },
    collections: {
      workspaceMembersCollection,
      workspaceIntegrationConnectionsCollection,
      allProjectsCollection,
      activeProjectsCollection,
      archivedProjectsCollection,
      allTasksCollection,
      activeTasksCollection,
      archivedTasksCollection,
      timeEntriesCollection,
    },
    preload: async () => {
      if (!preloadPromise) {
        preloadPromise = Promise.all([
          workspaceMembersCollection.preload(),
          workspaceIntegrationConnectionsCollection.preload(),
          allProjectsCollection.preload(),
          activeProjectsCollection.preload(),
          archivedProjectsCollection.preload(),
          allTasksCollection.preload(),
          activeTasksCollection.preload(),
          archivedTasksCollection.preload(),
          timeEntriesCollection.preload(),
        ]).then(() => {});
      }

      return preloadPromise;
    },
    dispose: async () => {
      abortController.abort();

      await Promise.allSettled([
        workspaceRuntime.dispose(),
        workspaceMembersCollection.cleanup(),
        workspaceIntegrationConnectionsCollection.cleanup(),
        allProjectsCollection.cleanup(),
        activeProjectsCollection.cleanup(),
        archivedProjectsCollection.cleanup(),
        allTasksCollection.cleanup(),
        activeTasksCollection.cleanup(),
        archivedTasksCollection.cleanup(),
        timeEntriesCollection.cleanup(),
      ]);
    },
  };
}
