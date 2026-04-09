import { snakeCamelMapper } from "@electric-sql/client";
import { WorkspaceIntegration } from "@recount/core/modules/integration";
import { Project } from "@recount/core/modules/project";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { electricCollectionOptions } from "@tanstack/electric-db-collection";
import { createCollection, useLiveQuery } from "@tanstack/react-db";
import type {
  Context,
  InitialQueryBuilder,
  QueryBuilder,
} from "@tanstack/react-db";
import { Schema } from "effect";

import { env } from "~/lib/env";

export type WorkspaceCollections = Awaited<
  ReturnType<typeof createWorkspaceCollections>
>;

// Bridge until TanStack DB persistence is generally available: keep the
// current workspace's collections alive in memory after startup preload.
let activeWorkspaceId: string | null = null;
let activeWorkspacePromise: Promise<WorkspaceCollections> | null = null;
let activeWorkspaceCollections: WorkspaceCollections | null = null;
let activeWorkspaceVersion = 0;

async function createWorkspaceCollections(workspaceId: string) {
  const workspaceFetchClient: typeof fetch = Object.assign(
    (url: RequestInfo | URL, options?: RequestInit) =>
      fetch(url, {
        ...options,
        credentials: "include",
        headers: {
          ...options?.headers,
          [WORKSPACE_ID_HEADER]: workspaceId,
        },
      }),
    {
      preconnect: fetch.preconnect?.bind(fetch),
    }
  );

  const workspaceMembersCollection = createCollection(
    electricCollectionOptions({
      id: "workspace-members",
      schema: Schema.toStandardSchemaV1(WorkspaceMember.json),
      getKey: (workspaceMember) => workspaceMember.id,
      shapeOptions: {
        url: `${env.VITE_ELECTRIC_PROXY_URL}/workspace-members`,
        columnMapper: snakeCamelMapper(),
        fetchClient: workspaceFetchClient,
      },
    })
  );

  const workspaceIntegrationsCollection = createCollection(
    electricCollectionOptions({
      id: "workspace-integrations",
      schema: Schema.toStandardSchemaV1(WorkspaceIntegration.json),
      getKey: (workspaceIntegration) => workspaceIntegration.id,
      shapeOptions: {
        url: `${env.VITE_ELECTRIC_PROXY_URL}/workspace-integrations`,
        columnMapper: snakeCamelMapper(),
        fetchClient: workspaceFetchClient,
      },
    })
  );

  const projectsCollection = createCollection(
    electricCollectionOptions({
      id: "projects",
      schema: Schema.toStandardSchemaV1(Project.json),
      getKey: (project) => project.id,
      shapeOptions: {
        url: `${env.VITE_ELECTRIC_PROXY_URL}/projects`,
        columnMapper: snakeCamelMapper(),
        fetchClient: workspaceFetchClient,
      },
    })
  );

  return {
    workspaceMembersCollection,
    workspaceIntegrationsCollection,
    projectsCollection,
  };
}

export async function preloadWorkspaceCollections(
  workspaceId: string
): Promise<void> {
  // Bridge until persistence lands: eagerly sync core workspace data during
  // route startup so the app renders from warm collections.
  if (workspaceId !== activeWorkspaceId || activeWorkspacePromise === null) {
    const workspaceVersion = activeWorkspaceVersion + 1;

    activeWorkspaceVersion = workspaceVersion;
    activeWorkspaceId = workspaceId;
    activeWorkspaceCollections = null;
    activeWorkspacePromise = createWorkspaceCollections(workspaceId).then(
      (collections) => {
        if (workspaceVersion === activeWorkspaceVersion) {
          activeWorkspaceCollections = collections;
        }

        return collections;
      }
    );
  }

  const {
    workspaceMembersCollection,
    workspaceIntegrationsCollection,
    projectsCollection,
  } = await activeWorkspacePromise;

  await Promise.all([
    workspaceMembersCollection.preload(),
    workspaceIntegrationsCollection.preload(),
    projectsCollection.preload(),
  ]);
}

export function useWorkspaceLiveQuery<TContext extends Context>(
  queryFn: (
    q: InitialQueryBuilder,
    collections: WorkspaceCollections
  ) => QueryBuilder<TContext> | undefined | null,
  deps?: Array<unknown>
) {
  if (activeWorkspaceCollections === null) {
    throw new Error("Workspace collections have not been initialized");
  }

  const collections = activeWorkspaceCollections;

  return useLiveQuery((q) => queryFn(q, collections), deps);
}
