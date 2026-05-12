import { eq, toArray, useLiveQuery } from "@tanstack/react-db";

import { useWorkspaceDb } from "~/db/workspace/context";

export type TimeEntryFormProject = {
  id: string;
  name: string;
  tasks: Array<{
    id: string;
    name: string;
  }>;
};

export function useTimeEntryFormProjects() {
  const workspaceDb = useWorkspaceDb();

  return useLiveQuery((q) =>
    q
      .from({ p: workspaceDb.collections.activeProjectsCollection })
      .select(({ p }) => ({
        ...p,
        tasks: toArray(
          q
            .from({ t: workspaceDb.collections.tasksCollection })
            .where(({ t }) => eq(p.id, t.projectId))
        ),
      }))
  );
}
