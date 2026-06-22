import type { TimeEntryId } from "@recount/core/shared/schemas";
import { eq, useLiveQuery } from "@tanstack/react-db";

import { useWorkspaceDb } from "~/db/workspace/context";

export function useTimeEntries({
  replacingTimeEntryId,
}: {
  replacingTimeEntryId: TimeEntryId | null | undefined;
}) {
  const workspaceDb = useWorkspaceDb();
  const { data: timeEntries = [] } = useLiveQuery((q) =>
    q
      .from({ timeEntry: workspaceDb.collections.timeEntriesCollection })
      .innerJoin(
        { project: workspaceDb.collections.allProjectsCollection },
        ({ project, timeEntry }) => eq(project.id, timeEntry.projectId)
      )
  );

  return timeEntries
    .filter(({ timeEntry }) => timeEntry.id !== replacingTimeEntryId)
    .map(({ project, timeEntry }) => ({
      id: timeEntry.id,
      project: {
        name: project.name,
        color: project.color,
      },
      startedAt: timeEntry.startedAt,
      stoppedAt: timeEntry.stoppedAt,
    }));
}
