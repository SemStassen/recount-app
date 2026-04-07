import { UserSettings } from "@recount/core/modules/identity";
import { WorkspaceIntegration } from "@recount/core/modules/integration";
import { Project } from "@recount/core/modules/project";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import {
  BrowserCollectionCoordinator,
  createBrowserWASQLitePersistence,
  openBrowserWASQLiteOPFSDatabase,
} from "@tanstack/browser-db-sqlite-persistence";
import { Schema } from "effect";

import { env } from "~/lib/env";

import { createCollectionTemp } from "./create-collection-temp";

export type WorkspaceCollections = Awaited<
  ReturnType<typeof createWorkspaceCollections>
>;

export async function createWorkspaceCollections(workspaceId: string) {
  const database = await openBrowserWASQLiteOPFSDatabase({
    databaseName: `recount-${workspaceId}.sqlite`,
  });

  const coordinator = new BrowserCollectionCoordinator({
    dbName: `recount-${workspaceId}`,
  });

  const muUserSettingsCollection = createCollectionTemp({
    persistence: createBrowserWASQLitePersistence<
      typeof UserSettings.json.Type,
      string | number
    >({
      database,
      coordinator,
    }),
    schemaVersion: 1,
    id: "my-user-settings",
    schema: Schema.toStandardSchemaV1(UserSettings.json),
    getKey: (wm) => wm.id,
    shapeOptions: {
      url: `${env.VITE_ELECTRIC_PROXY_URL}/me/user-settings`,
      fetchClient: (url, options) =>
        fetch(url, {
          ...options,
          credentials: "include",
        }),
    },
  });

  const workspaceMembersCollection = createCollectionTemp({
    persistence: createBrowserWASQLitePersistence<
      typeof WorkspaceMember.json.Type,
      string | number
    >({
      database,
      coordinator,
    }),
    schemaVersion: 1,
    id: "workspace-members",
    schema: Schema.toStandardSchemaV1(WorkspaceMember.json),
    getKey: (wm) => wm.id,
    shapeOptions: {
      url: `${env.VITE_ELECTRIC_PROXY_URL}/workspace-members`,
      fetchClient: (url, options) =>
        fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options?.headers,
            [WORKSPACE_ID_HEADER]: workspaceId,
          },
        }),
    },
  });

  const workspaceIntegrationsCollection = createCollectionTemp({
    persistence: createBrowserWASQLitePersistence<
      typeof WorkspaceIntegration.json.Type,
      string | number
    >({
      database,
      coordinator,
    }),
    schemaVersion: 1,
    id: "workspace-integrations",
    schema: Schema.toStandardSchemaV1(WorkspaceIntegration.json),
    getKey: (wm) => wm.id,
    shapeOptions: {
      url: `${env.VITE_ELECTRIC_PROXY_URL}/workspace-integrations`,
      fetchClient: (url, options) =>
        fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options?.headers,
            [WORKSPACE_ID_HEADER]: workspaceId,
          },
        }),
    },
  });

  const projectsCollection = createCollectionTemp({
    persistence: createBrowserWASQLitePersistence<
      typeof Project.json.Type,
      string | number
    >({
      database,
      coordinator,
    }),
    schemaVersion: 1,
    id: "projects",
    schema: Schema.toStandardSchemaV1(Project.json),
    getKey: (wm) => wm.id,
    shapeOptions: {
      url: `${env.VITE_ELECTRIC_PROXY_URL}/projects`,
      fetchClient: (url, options) =>
        fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options?.headers,
            [WORKSPACE_ID_HEADER]: workspaceId,
          },
        }),
    },
  });

  return {
    workspaceMembersCollection,
    workspaceIntegrationsCollection,
    projectsCollection,
    close: async () => {
      coordinator.dispose();
      await database.close?.();
    },
  };
}
