import { addDays, isEqual, subDays } from "date-fns";
import { Atom } from "effect/unstable/reactivity";

import { currentTimeAtom } from "~/atoms/current-time.atom";
import { atomRegistry } from "~/atoms/registry";

import { getVisibleDays } from "./helpers";

export type CalendarView = "days";

type CalendarDragSelection = {
  firstSelected: Date;
  secondSelected: Date;
} | null;

export const calendarViewAtom = Atom.make<CalendarView>("days");
export const calendarDaysInViewAtom = Atom.make<number>(7);
export const calendarSelectedDateAtom = Atom.make(new Date());
export const calendarCurrentTimeAtom = currentTimeAtom;
export const calendarDragSelectionAtom = Atom.make<CalendarDragSelection>(null);
export const calendarCreateTimeEntrySelectionAtom =
  Atom.make<CalendarDragSelection>(null);
export const calendarIsDragSelectionActiveAtom = Atom.make(false);

export const calendarVisibleDaysAtom = Atom.transform(
  calendarSelectedDateAtom,
  (get, selectedDateAtom) =>
    getVisibleDays(get(selectedDateAtom), get(calendarDaysInViewAtom))
);

export const calendarSortedDragSelectionAtom = Atom.map(
  calendarDragSelectionAtom,
  sortDragSelection
);

export const calendarSortedCreateTimeEntrySelectionAtom = Atom.map(
  calendarCreateTimeEntrySelectionAtom,
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

export const calendarIsCreateSidebarOpenAtom = Atom.map(
  calendarCreateTimeEntrySelectionAtom,
  (dragSelection) => {
    return Boolean(dragSelection);
  }
);

export function setCalendarDaysInView(daysInView: number) {
  atomRegistry.set(calendarDaysInViewAtom, daysInView);
}

export function setCalendarSelectedDate(date: Date) {
  atomRegistry.set(calendarSelectedDateAtom, date);
}

export function goToNextPeriod() {
  atomRegistry.update(calendarSelectedDateAtom, (selectedDate) =>
    addDays(selectedDate, atomRegistry.get(calendarDaysInViewAtom))
  );
}

export function goToPreviousPeriod() {
  atomRegistry.update(calendarSelectedDateAtom, (selectedDate) =>
    subDays(selectedDate, atomRegistry.get(calendarDaysInViewAtom))
  );
}

export function resetDragSelection() {
  atomRegistry.set(calendarDragSelectionAtom, null);
}

export function resetCreateTimeEntrySelection() {
  atomRegistry.set(calendarCreateTimeEntrySelectionAtom, null);
}

export function commitDragSelection() {
  atomRegistry.set(
    calendarCreateTimeEntrySelectionAtom,
    atomRegistry.get(calendarDragSelectionAtom)
  );
}

export function setDragSelectionFirst(firstSelected: Date) {
  atomRegistry.set(calendarDragSelectionAtom, {
    firstSelected,
    secondSelected: firstSelected,
  });
}

export function setDragSelectionSecond(secondSelected: Date) {
  atomRegistry.update(calendarDragSelectionAtom, (dragSelection) => {
    if (
      !dragSelection ||
      isEqual(dragSelection.secondSelected, secondSelected)
    ) {
      return dragSelection;
    }

    return {
      ...dragSelection,
      secondSelected,
    };
  });
}

export function setIsDragSelectionActive(isDragSelectionActive: boolean) {
  atomRegistry.set(calendarIsDragSelectionActiveAtom, isDragSelectionActive);
}
