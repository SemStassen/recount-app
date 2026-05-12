import { useAtomSet } from "@effect/atom-react";
import type { TimeEntryId } from "@recount/core/shared/schemas";

import { DraggableTimeEntry } from "../dnd/draggable-time-entry";
import { type EditingPreview, openUpdateTimeEntryEditor } from "../state/atoms";
import { DragSelectionHighlight } from "./drag-selection-highlight";
import { getDayTimeEntryFrames } from "./layout";
import { TimeEntryContent, TimeEntryFrame } from "./time-entry";
import { TimeEntryDropPreview } from "./time-entry-drop-preview";
import { TimeEntryPreview } from "./time-entry-preview";
import type { TimeEntry } from "./types";

export function DayColumn({
  currentTime,
  day,
  preview,
  projects,
  timeEntryDropPreview,
  timeEntries,
}: {
  currentTime: Date;
  day: Date;
  preview: EditingPreview;
  projects: Array<{ id: string; name: string; color: string }>;
  timeEntryDropPreview: TimeEntry | null;
  timeEntries: Array<TimeEntry>;
}) {
  const openUpdateEditor = useAtomSet(openUpdateTimeEntryEditor);
  const timeEntryFrames = getDayTimeEntryFrames({ day, timeEntries });

  return (
    <div className="relative">
      <DragSelectionHighlight day={day} />
      {timeEntryFrames.map(({ overlap, timeEntry }) => (
        <TimeEntryFrame
          day={day}
          key={timeEntry.id}
          overlap={overlap}
          timeRange={timeEntry}
          className="p-0.5"
        >
          <DraggableTimeEntry id={timeEntry.id} timeRange={timeEntry}>
            <TimeEntryContent
              data-calendar-entry=""
              onClick={() => {
                openUpdateEditor({
                  timeEntryId: timeEntry.id as TimeEntryId,
                });
              }}
              timeEntry={timeEntry}
            />
          </DraggableTimeEntry>
        </TimeEntryFrame>
      ))}
      <TimeEntryPreview
        currentTime={currentTime}
        day={day}
        preview={preview}
        projects={projects}
      />
      <TimeEntryDropPreview day={day} timeEntry={timeEntryDropPreview} />
    </div>
  );
}
