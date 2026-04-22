import { snakeCamelMapper } from "@electric-sql/client";
import { WorkspaceIntegration } from "@recount/core/modules/integration";
import { Project } from "@recount/core/modules/project";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection } from "@tanstack/react-db";
import { Schema, Struct } from "effect";

import { env } from "~/lib/env";

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
      id: createCollectionId("workspace-members"),
      schema: Schema.toStandardSchemaV1(WorkspaceMember.json),
      getKey: (workspaceMember) => workspaceMember.id,
      shapeOptions: {
        url: `${env.VITE_ELECTRIC_PROXY_URL}/workspace-members`,
        columnMapper: snakeCamelMapper(),
        transformer: (row) =>
          Schema.decodeUnknownSync(
            WorkspaceMember.json.mapFields(Struct.map(Schema.optionalKey))
          )(row),
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
      },
    })
  );

  const workspaceIntegrationsCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId("workspace-integrations"),
      schema: Schema.toStandardSchemaV1(WorkspaceIntegration.json),
      getKey: (workspaceIntegration) => workspaceIntegration.id,
      shapeOptions: {
        url: `${env.VITE_ELECTRIC_PROXY_URL}/workspace-integrations`,
        columnMapper: snakeCamelMapper(),
        transformer: (row) =>
          Schema.decodeUnknownSync(
            WorkspaceIntegration.json
              .mapFields(
                Struct.evolve({
                  createdAt: () => Schema.DateTimeUtcFromString,
                })
              )
              .mapFields(Struct.map(Schema.optionalKey))
          )(row),
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
      },
    })
  );

  const projectsCollection = createCollection(
    electricCollectionOptions({
      id: createCollectionId("projects"),
      schema: Schema.toStandardSchemaV1(Project.json),
      getKey: (project) => project.id,
      shapeOptions: {
        url: `${env.VITE_ELECTRIC_PROXY_URL}/projects`,
        columnMapper: snakeCamelMapper(),
        transformer: (row) =>
          Schema.decodeUnknownSync(
            Project.json
              .mapFields(
                Struct.evolve({
                  startDate: () =>
                    Schema.OptionFromNullOr(Schema.DateTimeUtcFromString),
                  targetDate: () =>
                    Schema.OptionFromNullOr(Schema.DateTimeUtcFromString),
                })
              )
              .mapFields(Struct.map(Schema.optionalKey))
          )(row),
        fetchClient: workspaceFetchClient,
        signal: abortController.signal,
      },
    })
  );

  let preloadPromise: Promise<void> | null = null;

  return {
    collections: {
      workspaceMembersCollection,
      workspaceIntegrationsCollection,
      projectsCollection,
    },
    preload: async () => {
      if (!preloadPromise) {
        preloadPromise = Promise.all([
          workspaceMembersCollection.preload(),
          workspaceIntegrationsCollection.preload(),
          projectsCollection.preload(),
        ]).then(() => {});
      }

      return preloadPromise;
    },
    dispose: async () => {
      abortController.abort();

      await Promise.allSettled([
        workspaceMembersCollection.cleanup(),
        workspaceIntegrationsCollection.cleanup(),
        projectsCollection.cleanup(),
      ]);
    },
  };
}
