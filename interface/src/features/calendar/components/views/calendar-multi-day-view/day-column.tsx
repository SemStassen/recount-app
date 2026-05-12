import { useAtomSet } from "@effect/atom-react";
import type { TimeEntryId } from "@recount/core/shared/schemas";
import { areIntervalsOverlapping, isSameDay } from "date-fns";

import {
  type CalendarEditingPreview,
  openUpdateTimeEntryEditor,
} from "../../../atoms";
import { DraggableTimeEntry } from "../../dnd/draggable-time-entry";
import { DragSelectionHighlight } from "../drag-selection-highlight";
import { TimeEntryContent, TimeEntryFrame } from "../time-entry";
import { groupTimeEntries } from "./layout";
import { TimeEntryDropPreview } from "./time-entry-drop-preview";
import { TimeEntryPreview } from "./time-entry-preview";
import type { CalendarTimeEntry } from "./types";

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
  preview: CalendarEditingPreview;
  projects: Array<{ id: string; name: string; color: string }>;
  timeEntryDropPreview: CalendarTimeEntry | null;
  timeEntries: Array<CalendarTimeEntry>;
}) {
  const openUpdateEditor = useAtomSet(openUpdateTimeEntryEditor);
  const dayTimeEntries = timeEntries.filter(
    (timeEntry) =>
      isSameDay(timeEntry.startedAt, day) || isSameDay(timeEntry.stoppedAt, day)
  );
  const groupedTimeEntries = groupTimeEntries(dayTimeEntries);

  return (
    <div className="relative">
      <DragSelectionHighlight day={day} />
      {groupedTimeEntries.map((group, groupIndex) =>
        group.map((timeEntry) => {
          const hasOverlap = groupedTimeEntries.some(
            (otherGroup, otherIndex) =>
              otherIndex !== groupIndex &&
              otherGroup.some((otherTimeEntry) =>
                areIntervalsOverlapping(
                  {
                    start: timeEntry.startedAt,
                    end: timeEntry.stoppedAt,
                  },
                  {
                    start: otherTimeEntry.startedAt,
                    end: otherTimeEntry.stoppedAt,
                  }
                )
              )
          );
          const overlap = hasOverlap
            ? { index: groupIndex, count: groupedTimeEntries.length }
            : undefined;

          return (
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
          );
        })
      )}
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
