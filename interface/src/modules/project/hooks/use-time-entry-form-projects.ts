import { eq, toArray, useLiveQuery } from "@tanstack/react-db";

import { useWorkspaceDb } from "~/modules/workspace";

export interface TimeEntryFormProject {
  id: string;
  name: string;
  tasks: Array<{
    id: string;
    name: string;
  }>;
}

export function useTimeEntryFormProjects() {
  const workspaceDb = useWorkspaceDb();

  return useLiveQuery((q) =>
    q
      .from({ p: workspaceDb.collections.activeProjectsCollection })
      .select(({ p }) => ({
        ...p,
        tasks: toArray(
          q
            .from({ t: workspaceDb.collections.activeTasksCollection })
            .where(({ t }) => eq(p.id, t.projectId))
        ),
      }))
  );
}
