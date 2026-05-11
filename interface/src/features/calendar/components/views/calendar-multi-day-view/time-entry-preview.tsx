import { endOfDay, isWithinInterval, startOfDay } from "date-fns";

import type { CalendarEditingPreview } from "../../../atoms";
import { TimeEntryBlock } from "../time-entry-block";
import { getTimeEntryBlockHeight, getTimeEntryBlockStyle } from "./layout";
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
    <div
      className="absolute p-0.5"
      style={getTimeEntryBlockStyle(previewTimeEntry, day, 0, 1)}
    >
      <TimeEntryBlock
        style={{
          height: getTimeEntryBlockHeight(previewTimeEntry, day),
        }}
        timeEntry={previewTimeEntry}
      />
    </div>
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
