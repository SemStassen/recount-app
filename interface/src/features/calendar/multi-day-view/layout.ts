import {
  addMinutes,
  areIntervalsOverlapping,
  differenceInMinutes,
  endOfDay,
  isBefore,
  isSameDay,
  startOfDay,
} from "date-fns";
import type { CSSProperties } from "react";

import { clamp } from "~/lib/utils/math";
import type { TimeRange } from "~/modules/time";

import {
  SLOT_DURATION_MINUTES,
  HOUR_HEIGHT_VAR,
  FIRST_VISIBLE_HOUR,
  LAST_VISIBLE_HOUR,
} from "../constants";

export interface CalendarRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface Slot {
  day: Date;
  index: number;
  start: Date;
  end: Date;
}

export function getSlotFromPoint({
  point,
  gridRect,
  scrollTop = 0,
  visibleDays,
}: {
  point: { clientX: number; clientY: number };
  gridRect: CalendarRect;
  scrollTop?: number;
  visibleDays: Array<Date>;
}): Slot | null {
  if (visibleDays.length === 0 || gridRect.width <= 0 || gridRect.height <= 0) {
    return null;
  }

  const dayWidth = gridRect.width / visibleDays.length;
  const dayIndex = clamp(
    Math.floor((point.clientX - gridRect.left) / dayWidth),
    0,
    visibleDays.length - 1
  );
  const visibleRangeMinutes = (LAST_VISIBLE_HOUR - FIRST_VISIBLE_HOUR) * 60;
  const slotCount = visibleRangeMinutes / SLOT_DURATION_MINUTES;
  const y = clamp(point.clientY - gridRect.top + scrollTop, 0, gridRect.height);
  const slotIndex = clamp(
    Math.floor((y / gridRect.height) * slotCount),
    0,
    slotCount - 1
  );
  const startMinutes =
    FIRST_VISIBLE_HOUR * 60 + slotIndex * SLOT_DURATION_MINUTES;
  const start = addMinutes(startOfDay(visibleDays[dayIndex]), startMinutes);

  return {
    day: visibleDays[dayIndex],
    index: slotIndex,
    start,
    end: addMinutes(start, SLOT_DURATION_MINUTES),
  };
}

export function getRangeFromSlots(
  firstSlot: Slot,
  secondSlot: Slot
): TimeRange {
  return isBefore(secondSlot.start, firstSlot.start)
    ? { startedAt: secondSlot.start, stoppedAt: firstSlot.end }
    : { startedAt: firstSlot.start, stoppedAt: secondSlot.end };
}

export function moveTimeRangeToSlot(
  timeRange: TimeRange,
  slot: Slot
): TimeRange {
  const durationInMinutes = differenceInMinutes(
    timeRange.stoppedAt,
    timeRange.startedAt
  );

  return {
    startedAt: slot.start,
    stoppedAt: addMinutes(slot.start, durationInMinutes),
  };
}

function groupTimeEntries<TEntry extends TimeRange>(
  timeEntries: Array<TEntry>
) {
  const sortedTimeEntries = timeEntries.toSorted(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime()
  );
  const groups: Array<Array<TEntry>> = [];

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

interface TimeEntryFrame<TEntry extends TimeRange> {
  timeEntry: TEntry;
  overlap?: { index: number; count: number };
}

export function getDayTimeEntryFrames<TEntry extends TimeRange>({
  day,
  timeEntries,
}: {
  day: Date;
  timeEntries: Array<TEntry>;
}): Array<TimeEntryFrame<TEntry>> {
  const dayTimeEntries = timeEntries.filter(
    (timeEntry) =>
      isSameDay(timeEntry.startedAt, day) || isSameDay(timeEntry.stoppedAt, day)
  );
  const groupedTimeEntries = groupTimeEntries(dayTimeEntries);

  return groupedTimeEntries.flatMap((group, groupIndex) =>
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

      return {
        timeEntry,
        overlap: hasOverlap
          ? { index: groupIndex, count: groupedTimeEntries.length }
          : undefined,
      };
    })
  );
}

function getTimeEntryPositionStyle(
  timeEntry: TimeRange,
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

export function getTimeEntryFrameStyle({
  day,
  timeRange,
  overlap,
}: {
  day: Date;
  timeRange: TimeRange;
  overlap?: { index: number; count: number };
}) {
  const style: CSSProperties = {
    ...getTimeEntryPositionStyle(
      timeRange,
      day,
      overlap?.index ?? 0,
      overlap?.count ?? 1
    ),
    height: getTimeEntryHeight(timeRange, day),
  };

  if (!overlap) {
    style.width = "100%";
    style.left = "0%";
  }

  return style;
}

function getTimeEntryHeight(timeEntry: TimeRange, day: Date) {
  const dayStart = startOfDay(day);
  const dayEnd = endOfDay(day);
  const startedAt =
    timeEntry.startedAt < dayStart ? dayStart : timeEntry.startedAt;
  const stoppedAt = timeEntry.stoppedAt > dayEnd ? dayEnd : timeEntry.stoppedAt;
  const durationInMinutes = differenceInMinutes(stoppedAt, startedAt);

  return `calc(${durationInMinutes / 60} * var(${HOUR_HEIGHT_VAR}))`;
}

export function getCurrentTimePosition(currentTime: Date) {
  const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
  const visibleStartMinutes = FIRST_VISIBLE_HOUR * 60;
  const visibleEndMinutes = LAST_VISIBLE_HOUR * 60;
  const visibleRangeMinutes = visibleEndMinutes - visibleStartMinutes;

  return ((minutes - visibleStartMinutes) / visibleRangeMinutes) * 100;
}
