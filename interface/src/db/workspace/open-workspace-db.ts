import { snakeCamelMapper } from "@electric-sql/client";
import { ProjectModuleLayer } from "@recount/core/modules/project";
import { TimeModuleLayer } from "@recount/core/modules/time";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { UserId, WorkspaceId } from "@recount/core/shared/schemas";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import {
  createCollection,
  createLiveQueryCollection,
  eq,
  not,
} from "@tanstack/react-db";
import { Layer, ManagedRuntime, Option } from "effect";

import { authFetch } from "~/lib/auth";
import { appRuntimeLayer } from "~/lib/runtime";
import { createClientProjectRepositoryLayer } from "~/lib/services/client-project-repository.layer";
import { createClientTaskRepositoryLayer } from "~/lib/services/client-task-repository.layer";
import { createClientTimeEntryRepositoryLayer } from "~/lib/services/client-time-entry-repository.layer";

import { workspaceShapes } from "../sync-shapes";
import { createProjectActions } from "./project-actions";
import { createTimeEntryActions } from "./time-entry-actions";

export type WorkspaceDb = Awaited<ReturnType<typeof openWorkspaceDb>>;

const fetchWithPreconnect = fetch as typeof fetch & {
  preconnect?: typeof fetch;
};

export async function openWorkspaceDb(workspaceId: string, userId: string) {
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
  const brandedUserId = UserId.make(userId);

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
  const timeEntryRepositoryLayer = createClientTimeEntryRepositoryLayer(
    timeEntriesCollection
  );
  const workspaceRuntime = ManagedRuntime.make(
    Layer.mergeAll(
      appRuntimeLayer,
      ProjectModuleLayer.pipe(
        Layer.provide(projectRepositoryLayer),
        Layer.provide(taskRepositoryLayer)
      ),
      TimeModuleLayer.pipe(
        Layer.provide(timeEntryRepositoryLayer)
      )
    )
  );

  const projectActions = createProjectActions({
    workspaceId: brandedWorkspaceId,
    workspaceRuntime,
    allProjectsCollection,
    allTasksCollection,
  });
  const timeEntryActions = createTimeEntryActions({
    userId: brandedUserId,
    workspaceId: brandedWorkspaceId,
    workspaceRuntime,
    workspaceMembersCollection,
    timeEntriesCollection,
  });

  let preloadPromise: Promise<void> | null = null;

  return {
    actions: {
      ...projectActions,
      ...timeEntryActions,
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
