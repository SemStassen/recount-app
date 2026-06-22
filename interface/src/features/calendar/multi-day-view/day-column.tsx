import { useAtomSet } from "@effect/atom-react";
import type { TimeEntryId } from "@recount/core/shared/schemas";

import {
  type EditingPreview,
  openUpdateTimeEntryEditor,
  type TimeRange,
} from "~/modules/time";

import { DraggableTimeEntry } from "../dnd/draggable-time-entry";
import { DragSelectionHighlight } from "./drag-selection-highlight";
import { getDayTimeEntryFrames } from "./layout";
import { TimeEntryContent, TimeEntryFrame } from "./time-entry";
import { TimeEntryDropPreview } from "./time-entry-drop-preview";
import { TimeEntryPreview } from "./time-entry-preview";

interface CalendarTimeEntry extends TimeRange {
  id: string;
  project: null | {
    name: string;
    color: string;
  };
}

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
  timeEntryDropPreview: CalendarTimeEntry | null;
  timeEntries: Array<CalendarTimeEntry>;
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
