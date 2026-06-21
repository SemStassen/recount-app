import type { UserId, WorkspaceId } from "@recount/core/shared/schemas";

import type { AppRuntimeLayer } from "~/lib/runtime";
import { createCurrentResourceRegistry } from "~/lib/utils/create-resource-registry";

import { openWorkspaceDb } from "./open-workspace-db";

interface WorkspaceDbKey {
  readonly userId: UserId;
  readonly workspaceId: WorkspaceId;
}

export const makeWorkspaceDbRegistry = (runtimeLayer: AppRuntimeLayer) =>
  createCurrentResourceRegistry({
    load: async (key: WorkspaceDbKey) => {
      const workspaceDb = await openWorkspaceDb(
        key.workspaceId,
        key.userId,
        runtimeLayer
      );

      await workspaceDb.preload();

      return workspaceDb;
    },
    equals: (a, b) =>
      a.workspaceId === b.workspaceId && a.userId === b.userId,
  });

export type WorkspaceDbRegistry = ReturnType<typeof makeWorkspaceDbRegistry>;
