import { addDays } from "date-fns";

export function getVisibleDays(selectedDate: Date, daysInView: number) {
  return Array.from({ length: daysInView }).map((_, dayIndex) =>
    addDays(selectedDate, dayIndex)
  );
}
