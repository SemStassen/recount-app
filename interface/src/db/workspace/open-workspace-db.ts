import { snakeCamelMapper } from "@electric-sql/client";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";

import { workspaceShapes } from "../sync-shapes";

export type WorkspaceDb = Awaited<ReturnType<typeof openWorkspaceDb>>;

export async function openWorkspaceDb(workspaceId: string) {
  const abortController = new AbortController();
  const workspaceFetchClient: typeof fetch = Object.assign(
    (url: RequestInfo | URL, options?: RequestInit) =>
      fetch(url, {
        ...options,
        credentials: "include",
        cache: "no-store",
        headers: {
          ...options?.headers,
          [WORKSPACE_ID_HEADER]: workspaceId,
        },
      }),
    {
      preconnect: fetch.preconnect?.bind(fetch),
    }
  );

  const createCollectionId = (collectionId: string) =>
    `workspace:${workspaceId}:${collectionId}`;

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

  const projectsCollection = createCollection(
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

  const tasksCollection = createCollection(
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

  let preloadPromise: Promise<void> | null = null;

  return {
    collections: {
      workspaceMembersCollection,
      workspaceIntegrationConnectionsCollection,
      projectsCollection,
      tasksCollection,
    },
    preload: async () => {
      if (!preloadPromise) {
        preloadPromise = Promise.all([
          workspaceMembersCollection.preload(),
          workspaceIntegrationConnectionsCollection.preload(),
          projectsCollection.preload(),
          tasksCollection.preload(),
        ]).then(() => {});
      }

      return preloadPromise;
    },
    dispose: async () => {
      abortController.abort();

      await Promise.allSettled([
        workspaceMembersCollection.cleanup(),
        workspaceIntegrationConnectionsCollection.cleanup(),
        projectsCollection.cleanup(),
        tasksCollection.cleanup(),
      ]);
    },
  };
}
