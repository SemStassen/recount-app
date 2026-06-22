import { addDays, nextMonday, set } from "date-fns";
import { describe, expect, test } from "vitest";

import { getCalendarRangeFromSlots, getCalendarSlotFromPoint, getDayTimeEntryFrames, moveTimeRangeToSlot } from '../../src/features/calendar/views/calendar-multi-day-view/layout';
import type { CalendarRect } from '../../src/features/calendar/views/calendar-multi-day-view/layout';

const gridRect: CalendarRect = {
  left: 100,
  top: 50,
  width: 700,
  height: 1536,
};

const weekAnchor = new Date(2026, 4, 10);
const monday = nextMonday(weekAnchor);
const tuesday = addDays(monday, 1);
const visibleDays = [monday, tuesday];

function localTime(dayOffset: number, hour: number, minute = 0) {
  return set(addDays(monday, dayOffset), {
    hours: hour,
    minutes: minute,
    seconds: 0,
    milliseconds: 0,
  });
}

describe("calendar grid geometry", () => {
  test("resolves a point to the containing slot", () => {
    const slot = getCalendarSlotFromPoint({
      point: { clientX: 120, clientY: 50 + 10 * 64 + 10 },
      gridRect,
      visibleDays,
    });

    expect(slot?.day).toBe(monday);
    expect(slot?.index).toBe(40);
    expect(slot?.start).toEqual(localTime(0, 10));
    expect(slot?.end).toEqual(localTime(0, 10, 15));
  });

  test("clamps points to visible days and hours", () => {
    const slot = getCalendarSlotFromPoint({
      point: { clientX: 900, clientY: 2000 },
      gridRect,
      visibleDays,
    });

    expect(slot?.day).toBe(tuesday);
    expect(slot?.start).toEqual(localTime(1, 23, 45));
    expect(slot?.end).toEqual(localTime(2, 0));
  });

  test("uses scrollTop for content-relative vertical hit-testing", () => {
    const slot = getCalendarSlotFromPoint({
      point: { clientX: 120, clientY: 50 },
      gridRect,
      scrollTop: 8 * 64,
      visibleDays,
    });

    expect(slot?.start).toEqual(localTime(0, 8));
  });

  test("creates inclusive forward and backward ranges", () => {
    const firstSlot = getCalendarSlotFromPoint({
      point: { clientX: 120, clientY: 50 + 10 * 64 },
      gridRect,
      visibleDays,
    });
    const secondSlot = getCalendarSlotFromPoint({
      point: { clientX: 120, clientY: 50 + 10 * 64 + 40 },
      gridRect,
      visibleDays,
    });

    if (!firstSlot || !secondSlot) {
      throw new Error("Expected slots");
    }

    expect(getCalendarRangeFromSlots(firstSlot, secondSlot)).toEqual({
      startedAt: localTime(0, 10),
      stoppedAt: localTime(0, 10, 45),
    });
    expect(getCalendarRangeFromSlots(secondSlot, firstSlot)).toEqual({
      startedAt: localTime(0, 10),
      stoppedAt: localTime(0, 10, 45),
    });
  });

  test("supports continuous cross-day ranges", () => {
    const firstSlot = getCalendarSlotFromPoint({
      point: { clientX: 120, clientY: 50 + 15 * 64 },
      gridRect,
      visibleDays,
    });
    const secondSlot = getCalendarSlotFromPoint({
      point: { clientX: 600, clientY: 50 + 9 * 64 },
      gridRect,
      visibleDays,
    });

    if (!firstSlot || !secondSlot) {
      throw new Error("Expected slots");
    }

    expect(getCalendarRangeFromSlots(firstSlot, secondSlot)).toEqual({
      startedAt: localTime(0, 15),
      stoppedAt: localTime(1, 9, 15),
    });
  });

  test("moves a range to a slot while preserving duration", () => {
    const slot = getCalendarSlotFromPoint({
      point: { clientX: 600, clientY: 50 + 23 * 64 + 32 },
      gridRect,
      visibleDays,
    });

    if (!slot) {
      throw new Error("Expected slot");
    }

    expect(
      moveTimeRangeToSlot(
        {
          startedAt: localTime(0, 8),
          stoppedAt: localTime(0, 9, 30),
        },
        slot
      )
    ).toEqual({
      startedAt: localTime(1, 23, 30),
      stoppedAt: localTime(2, 1),
    });
  });

  test("assigns overlap frames inside layout policy", () => {
    const frames = getDayTimeEntryFrames({
      day: monday,
      timeEntries: [
        {
          id: "first",
          project: null,
          startedAt: localTime(0, 9),
          stoppedAt: localTime(0, 10),
        },
        {
          id: "second",
          project: null,
          startedAt: localTime(0, 9, 30),
          stoppedAt: localTime(0, 10, 30),
        },
        {
          id: "third",
          project: null,
          startedAt: localTime(0, 11),
          stoppedAt: localTime(0, 12),
        },
      ],
    });

    expect(frames).toMatchObject([
      { timeEntry: { id: "first" }, overlap: { index: 0, count: 2 } },
      { timeEntry: { id: "third" }, overlap: undefined },
      { timeEntry: { id: "second" }, overlap: { index: 1, count: 2 } },
    ]);
  });
});
