import { endOfDay, isWithinInterval, startOfDay } from "date-fns";

import type { CalendarEditingPreview } from "../../../atoms";
import { TimeEntryContent, TimeEntryFrame } from "../time-entry";
import type { CalendarTimeEntry } from "./types";

type TimeEntryPreviewProps = {
  currentTime: Date;
  day: Date;
  preview: CalendarEditingPreview;
  projects: Array<{ id: string; name: string; color: string }>;
};

export function TimeEntryPreview({
  currentTime,
  day,
  preview,
  projects,
}: TimeEntryPreviewProps) {
  const previewTimeEntry = getPreviewTimeEntry({
    currentTime,
    day,
    preview,
    projects,
  });

  if (!previewTimeEntry) {
    return null;
  }

  return (
    <TimeEntryFrame className="p-0.5" day={day} timeRange={previewTimeEntry}>
      <TimeEntryContent timeEntry={previewTimeEntry} variant="preview" />
    </TimeEntryFrame>
  );
}

function getPreviewTimeEntry({
  currentTime,
  day,
  preview,
  projects,
}: TimeEntryPreviewProps): CalendarTimeEntry | null {
  if (!preview) {
    return null;
  }

  const stoppedAt = preview.stoppedAt ?? currentTime;

  if (
    stoppedAt <= preview.startedAt ||
    !isWithinInterval(day, {
      start: startOfDay(preview.startedAt),
      end: endOfDay(stoppedAt),
    })
  ) {
    return null;
  }

  const project = projects.find((project) => project.id === preview.projectId);

  return {
    id: "preview",
    project: project
      ? {
          name: project.name,
          color: project.color,
        }
      : null,
    startedAt: preview.startedAt,
    stoppedAt,
  };
}
