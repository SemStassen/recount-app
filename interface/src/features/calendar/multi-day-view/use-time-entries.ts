import { eq, useLiveQuery } from "@tanstack/react-db";
import { DateTime, Option } from "effect";

import { useWorkspaceDb } from "~/db/workspace/context";

import type { TimeEntry } from "./types";

export function useTimeEntries({
  currentTime,
  replacingTimeEntryId,
}: {
  currentTime: Date;
  replacingTimeEntryId: string | null | undefined;
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
    .map(({ project, timeEntry }) => {
      return {
        id: timeEntry.id as string,
        project: {
          name: project.name,
          color: project.color,
        },
        startedAt: DateTime.toDate(timeEntry.startedAt),
        stoppedAt: Option.match(timeEntry.stoppedAt, {
          onNone: () => currentTime,
          onSome: DateTime.toDate,
        }),
      } satisfies TimeEntry;
    });
}
