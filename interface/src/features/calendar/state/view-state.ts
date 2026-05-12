import { addDays, format, isSameMonth, startOfWeek, subDays } from "date-fns";

import { WEEK_STARTS_ON } from "../constants";

export function getVisibleDays(selectedDate: Date, daysInView: number) {
  return Array.from({ length: daysInView }).map((_, dayIndex) =>
    addDays(selectedDate, dayIndex)
  );
}

export function getVisibleRangeLabel(visibleDays: Array<Date>) {
  const firstDay = visibleDays[0];
  const lastDay = visibleDays.at(-1);

  if (!firstDay || !lastDay) {
    return "";
  }

  if (isSameMonth(firstDay, lastDay)) {
    return `${format(firstDay, "MMM")} ${format(lastDay, "yyyy")}`;
  }

  return `${format(firstDay, "MMM")} / ${format(lastDay, "MMM")} ${format(lastDay, "yy")}`;
}

export function getSelectedDateFromPicker({
  date,
  daysInView,
}: {
  date: Date | undefined;
  daysInView: number;
}) {
  if (!date) {
    return null;
  }

  return daysInView === 1
    ? date
    : startOfWeek(date, { weekStartsOn: WEEK_STARTS_ON });
}

export function getPreviousPeriod(selectedDate: Date, daysInView: number) {
  return subDays(selectedDate, daysInView);
}

export function getNextPeriod(selectedDate: Date, daysInView: number) {
  return addDays(selectedDate, daysInView);
}
