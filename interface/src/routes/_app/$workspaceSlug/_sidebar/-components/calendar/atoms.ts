import { Atom } from "effect/unstable/reactivity";

import { currentTimeAtom } from "~/atoms/current-time.atom";

import { getVisibleDays } from "./helpers";

type CalendarDragSelection = {
  firstSelected: Date;
  secondSelected: Date;
} | null;

export const calendarDaysInViewAtom = Atom.make<number>(7);
export const calendarSelectedDateAtom = Atom.make(new Date());
export const calendarCurrentTimeAtom = currentTimeAtom;
export const calendarDragSelectionAtom = Atom.make<CalendarDragSelection>(null);
export const timeEntrySidebarSelectionAtom =
  Atom.make<CalendarDragSelection>(null);
export const isTimeEntrySidebarOpenAtom = Atom.make(false);

export const calendarVisibleDaysAtom = Atom.transform(
  calendarSelectedDateAtom,
  (get, selectedDateAtom) =>
    getVisibleDays(get(selectedDateAtom), get(calendarDaysInViewAtom))
);

export const calendarSortedDragSelectionAtom = Atom.map(
  calendarDragSelectionAtom,
  sortDragSelection
);

export const sortedTimeEntrySidebarSelectionAtom = Atom.map(
  timeEntrySidebarSelectionAtom,
  sortDragSelection
);

function sortDragSelection(dragSelection: CalendarDragSelection) {
  if (!dragSelection) {
    return null;
  }

  return dragSelection.firstSelected < dragSelection.secondSelected
    ? {
        start: dragSelection.firstSelected,
        end: dragSelection.secondSelected,
      }
    : {
        start: dragSelection.secondSelected,
        end: dragSelection.firstSelected,
      };
}
