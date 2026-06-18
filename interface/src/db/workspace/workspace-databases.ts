import type { UserId, WorkspaceId } from "@recount/core/shared/schemas";

import type { AppRuntimeLayer } from "~/lib/runtime";
import { createSingleKeyResource } from "~/lib/utils/create-single-key-resource";

import { openWorkspaceDb } from "./open-workspace-db";

interface WorkspaceDatabaseKey {
  readonly userId: UserId;
  readonly workspaceId: WorkspaceId;
}

export const makeWorkspaceDatabases = (runtimeLayer: AppRuntimeLayer) =>
  createSingleKeyResource({
    create: (key: WorkspaceDatabaseKey) =>
      openWorkspaceDb(key.workspaceId, key.userId, runtimeLayer),
    equals: (a, b) => a.workspaceId === b.workspaceId && a.userId === b.userId,
  });

export type WorkspaceDatabases = ReturnType<typeof makeWorkspaceDatabases>;
