import { endOfDay, isWithinInterval, startOfDay } from "date-fns";

import { DraggableTimeEntry } from "../dnd/draggable-time-entry";
import type { EditingPreview } from "../state/atoms";
import { TimeEntryContent, TimeEntryFrame } from "./time-entry";
import type { TimeEntry } from "./types";

type TimeEntryPreviewProps = {
  currentTime: Date;
  day: Date;
  preview: EditingPreview;
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
      {preview?.replacingTimeEntryId ? (
        <DraggableTimeEntry
          id={preview.replacingTimeEntryId}
          timeRange={previewTimeEntry}
        >
          <TimeEntryContent
            data-calendar-entry=""
            timeEntry={previewTimeEntry}
            variant="preview"
          />
        </DraggableTimeEntry>
      ) : (
        <TimeEntryContent timeEntry={previewTimeEntry} variant="preview" />
      )}
    </TimeEntryFrame>
  );
}

function getPreviewTimeEntry({
  currentTime,
  day,
  preview,
  projects,
}: TimeEntryPreviewProps): TimeEntry | null {
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
