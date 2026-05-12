import { describe, expect, test } from "vitest";

import {
  getCalendarSelectedDateFromPicker,
  getCalendarVisibleDays,
  getNextCalendarPeriod,
  getPreviousCalendarPeriod,
} from "../../src/features/calendar/state/view-state";

describe("calendar view state", () => {
  test("derives visible days from the selected date", () => {
    const selectedDate = new Date(2026, 4, 11);

    expect(getCalendarVisibleDays(selectedDate, 3)).toEqual([
      new Date(2026, 4, 11),
      new Date(2026, 4, 12),
      new Date(2026, 4, 13),
    ]);
  });

  test("keeps day picker selection exact in day view", () => {
    const selectedDate = new Date(2026, 4, 13);

    expect(
      getCalendarSelectedDateFromPicker({ date: selectedDate, daysInView: 1 })
    ).toBe(selectedDate);
  });

  test("normalizes picker selection to week start in multi-day view", () => {
    expect(
      getCalendarSelectedDateFromPicker({
        date: new Date(2026, 4, 13),
        daysInView: 7,
      })
    ).toEqual(new Date(2026, 4, 11));
  });

  test("moves by the current period length", () => {
    const selectedDate = new Date(2026, 4, 11);

    expect(getPreviousCalendarPeriod(selectedDate, 7)).toEqual(
      new Date(2026, 4, 4)
    );
    expect(getNextCalendarPeriod(selectedDate, 7)).toEqual(
      new Date(2026, 4, 18)
    );
  });
});
