import { createSingleKeyResource } from "~/lib/utils/create-single-key-resource";

import { openWorkspaceDb } from "./open-workspace-db";

interface WorkspaceDbKey {
  readonly workspaceId: string;
  readonly userId: string;
}

const workspaceDbResource = createSingleKeyResource({
  create: (key: WorkspaceDbKey) => openWorkspaceDb(key.workspaceId, key.userId),
  equals: (a, b) => a.workspaceId === b.workspaceId && a.userId === b.userId,
});

export async function getWorkspaceDb(workspaceId: string, userId: string) {
  return workspaceDbResource.get({ workspaceId, userId });
}
