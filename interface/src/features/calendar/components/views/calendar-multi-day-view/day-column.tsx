import type { TimeEntryId } from "@recount/core/shared/schemas";
import { areIntervalsOverlapping, isSameDay } from "date-fns";

import { openUpdateTimeEntryEditor } from "../../../actions";
import type { CalendarEditingPreview } from "../../../atoms";
import {
  CALENDAR_HOUR_HEIGHT_VAR,
  CALENDAR_SLOTS_PER_HOUR,
} from "../../../constants";
import { useCalendarDragSelection } from "../../../use-calendar-drag-selection";
import { DraggableTimeEntry } from "../../dnd/draggable-time-entry";
import { DroppableTimeEntry } from "../../dnd/droppable-time-entry";
import { DragSelectionHighlight } from "../drag-selection-highlight";
import { TimeEntryBlock } from "../time-entry-block";
import { hours } from "./hour-column";
import {
  getCalendarSlotDate,
  getTimeEntryBlockHeight,
  getTimeEntryBlockStyle,
  groupTimeEntries,
} from "./layout";
import { TimeEntryPreview } from "./time-entry-preview";
import type { CalendarTimeEntry } from "./types";

const timeSlotsPerHour = Array.from({ length: CALENDAR_SLOTS_PER_HOUR }).map(
  (_, timeSlotIndex) => timeSlotIndex
);

export function DayColumn({
  currentTime,
  day,
  preview,
  projects,
  timeEntries,
}: {
  currentTime: Date;
  day: Date;
  preview: CalendarEditingPreview;
  projects: Array<{ id: string; name: string; color: string }>;
  timeEntries: Array<CalendarTimeEntry>;
}) {
  const { startDragSelection } = useCalendarDragSelection();
  const dayTimeEntries = timeEntries.filter(
    (timeEntry) =>
      isSameDay(timeEntry.startedAt, day) || isSameDay(timeEntry.stoppedAt, day)
  );
  const groupedTimeEntries = groupTimeEntries(dayTimeEntries);

  return (
    <div className="relative">
      <DragSelectionHighlight day={day} />
      {hours.map((hour) => (
        <div
          className="border-b"
          key={hour}
          style={{
            height: `var(${CALENDAR_HOUR_HEIGHT_VAR})`,
          }}
        >
          {timeSlotsPerHour.map((timeSlotIndex) => {
            const date = getCalendarSlotDate(
              day,
              hour,
              timeSlotIndex,
              timeSlotsPerHour.length
            );
            const minutes = date.getMinutes();

            return (
              <DroppableTimeEntry
                data-date={date}
                id={`${day.toString()}-${hour}-${minutes}`}
                key={timeSlotIndex}
                onPointerDown={startDragSelection}
                style={{
                  height: `calc(var(${CALENDAR_HOUR_HEIGHT_VAR}) / ${timeSlotsPerHour.length})`,
                }}
              />
            );
          })}
        </div>
      ))}
      {groupedTimeEntries.map((group, groupIndex) =>
        group.map((timeEntry) => {
          let style = getTimeEntryBlockStyle(
            timeEntry,
            day,
            groupIndex,
            groupedTimeEntries.length
          );
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

          if (!hasOverlap) {
            style = { ...style, width: "100%", left: "0%" };
          }

          return (
            <div className="absolute p-0.5" key={timeEntry.id} style={style}>
              <DraggableTimeEntry id={timeEntry.id}>
                <TimeEntryBlock
                  style={{
                    height: getTimeEntryBlockHeight(timeEntry, day),
                  }}
                  onClick={() => {
                    openUpdateTimeEntryEditor(timeEntry.id as TimeEntryId);
                  }}
                  timeEntry={timeEntry}
                />
              </DraggableTimeEntry>
            </div>
          );
        })
      )}
      <TimeEntryPreview
        currentTime={currentTime}
        day={day}
        preview={preview}
        projects={projects}
      />
    </div>
  );
}
