import { createContext, useContext } from "react";

import type { WorkspaceDb } from "./open-workspace-db";

export interface WorkspaceDbContext extends WorkspaceDb {}

export const WorkspaceDbContext = createContext<WorkspaceDbContext | null>(
  null
);

export function useWorkspaceDb() {
  const value = useContext(WorkspaceDbContext);

  if (!value) {
    throw new Error("useWorkspaceDb must be used within a WorkspaceDbProvider");
  }

  return value;
}
