import {
  differenceInMinutes,
  endOfDay,
  setHours,
  setMinutes,
  startOfDay,
} from "date-fns";

import {
  CALENDAR_HOUR_HEIGHT_VAR,
  FIRST_VISIBLE_HOUR,
  LAST_VISIBLE_HOUR,
} from "../../../constants";
import type { CalendarTimeEntry } from "./types";

export function getCalendarSlotDate(
  day: Date,
  hour: number,
  timeSlotIndex: number,
  slotsPerHour: number
) {
  return setMinutes(setHours(day, hour), timeSlotIndex * (60 / slotsPerHour));
}

export function groupTimeEntries(timeEntries: Array<CalendarTimeEntry>) {
  const sortedTimeEntries = timeEntries.toSorted(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
  );
  const groups: Array<Array<CalendarTimeEntry>> = [];

  for (const timeEntry of sortedTimeEntries) {
    let placed = false;

    for (const group of groups) {
      const lastTimeEntryInGroup = group.at(-1);

      if (
        lastTimeEntryInGroup &&
        timeEntry.startedAt >= lastTimeEntryInGroup.stoppedAt
      ) {
        group.push(timeEntry);
        placed = true;
        break;
      }
    }

    if (!placed) {
      groups.push([timeEntry]);
    }
  }

  return groups;
}

export function getTimeEntryBlockStyle(
  timeEntry: Pick<CalendarTimeEntry, "startedAt" | "stoppedAt">,
  day: Date,
  groupIndex: number,
  groupSize: number
) {
  const dayStart = startOfDay(day);
  const timeEntryStart =
    timeEntry.startedAt < dayStart ? dayStart : timeEntry.startedAt;
  const startMinutes = differenceInMinutes(timeEntryStart, dayStart);

  const visibleStartMinutes = FIRST_VISIBLE_HOUR * 60;
  const visibleEndMinutes = LAST_VISIBLE_HOUR * 60;
  const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;
  const top =
    ((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100;

  const width = 100 / groupSize;
  const left = groupIndex * width;

  return { top: `${top}%`, width: `${width}%`, left: `${left}%` };
}

export function getTimeEntryBlockHeight(
  timeEntry: Pick<CalendarTimeEntry, "startedAt" | "stoppedAt">,
  day: Date
) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const startedAt =
    timeEntry.startedAt < dayStart ? dayStart : timeEntry.startedAt;
  const stoppedAt = timeEntry.stoppedAt > dayEnd ? dayEnd : timeEntry.stoppedAt;
  const durationInMinutes = differenceInMinutes(stoppedAt, startedAt);

  return `calc(${durationInMinutes / 60} * var(${CALENDAR_HOUR_HEIGHT_VAR}))`;
}

export function getDragSelectionStyle(
  dragSelection: { start: Date; end: Date },
  day: Date
) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const selectionStart =
    dragSelection.start < dayStart ? dayStart : dragSelection.start;
  const selectionEnd = dragSelection.end > dayEnd ? dayEnd : dragSelection.end;

  const startMinutes = differenceInMinutes(selectionStart, dayStart);
  const endMinutes = differenceInMinutes(selectionEnd, dayStart);

  const visibleStartMinutes = FIRST_VISIBLE_HOUR * 60;
  const visibleEndMinutes = LAST_VISIBLE_HOUR * 60;
  const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;

  return {
    top: `${((startMinutes - visibleStartMinutes) / visibleRangeMinutes) * 100}%`,
    height: `${((endMinutes - startMinutes) / visibleRangeMinutes) * 100}%`,
  };
}

export function getCurrentTimePosition(currentTime: Date) {
  const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const visibleStartMinutes = FIRST_VISIBLE_HOUR * 60;
  const visibleEndMinutes = LAST_VISIBLE_HOUR * 60;
  const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;

  return ((minutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
}
