import type { UserId, WorkspaceId } from "@recount/core/shared/schemas";

import { createSingleKeyResource } from "~/lib/utils/create-single-key-resource";

import { openWorkspaceDb } from "./open-workspace-db";

interface WorkspaceDbKey {
  readonly workspaceId: WorkspaceId;
  readonly userId: UserId;
}

const workspaceDbResource = createSingleKeyResource({
  create: (key: WorkspaceDbKey) => openWorkspaceDb(key.workspaceId, key.userId),
  equals: (a, b) => a.workspaceId === b.workspaceId && a.userId === b.userId,
});

export async function getWorkspaceDb(workspaceId: WorkspaceId, userId: UserId) {
  return await workspaceDbResource.get({ userId, workspaceId });
}
