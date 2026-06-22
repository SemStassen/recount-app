import type { PropsWithChildren } from "react";

import { WorkspaceDbContext } from "./context";
import type { WorkspaceDb } from "./open-workspace-db";

interface WorkspaceDbProviderProps extends PropsWithChildren {
  workspaceDb: WorkspaceDb;
}

export function WorkspaceDbProvider({
  workspaceDb,
  children,
}: WorkspaceDbProviderProps) {
  return (
    <WorkspaceDbContext.Provider value={workspaceDb}>
      {children}
    </WorkspaceDbContext.Provider>
  );
}
