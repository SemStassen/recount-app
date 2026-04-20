import { createSingleKeyResource } from "~/lib/utils/create-single-key-resource";

import { openWorkspaceDb } from "./open-workspace-db";

const workspaceDbResource = createSingleKeyResource({
  create: (workspaceId: string) => openWorkspaceDb(workspaceId),
});

export async function getWorkspaceDb(workspaceId: string) {
  return workspaceDbResource.get(workspaceId);
}
