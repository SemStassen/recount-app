import { addDays, isEqual, subDays } from "date-fns";
import { Atom } from "effect/unstable/reactivity";

import { currentTimeAtom } from "./current-time.atom";
import { atomRegistry } from "./registry";

interface ICalendarAtom {
  view: "days";
  daysInView: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  selectedDate: Date;
  currentTime: Date;
  dragSelection: {
    firstSelected: Date;
    secondSelected: Date;
  } | null;
  isDragSelectionActive: boolean;
}

export const calendarViewAtom = Atom.make<ICalendarAtom["view"]>("days");
export const calendarDaysInViewAtom = Atom.make<ICalendarAtom["daysInView"]>(7);
export const calendarSelectedDateAtom = Atom.make<ICalendarAtom["selectedDate"]>(
  new Date()
);
export const calendarCurrentTimeAtom = currentTimeAtom;
export const calendarDragSelectionAtom = Atom.make<ICalendarAtom["dragSelection"]>(
  null
);
export const calendarSortedDragSelectionAtom = Atom.map(
  calendarDragSelectionAtom,
  (dragSelection) => {
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
);
export const calendarIsDragSelectionActiveAtom = Atom.make<
  ICalendarAtom["isDragSelectionActive"]
>(false);

export function setCalendarView(view: ICalendarAtom["view"]) {
  atomRegistry.set(calendarViewAtom, view);
}

export function setCalendarDaysInView(daysInView: ICalendarAtom["daysInView"]) {
  atomRegistry.set(calendarDaysInViewAtom, daysInView);
}

export function setCalendarSelectedDate(date: ICalendarAtom["selectedDate"]) {
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

export function setDragSelectionFirst(firstSelected: Date) {
  atomRegistry.set(calendarDragSelectionAtom, {
    firstSelected,
    secondSelected: firstSelected,
  });
}

export function setDragSelectionSecond(secondSelected: Date) {
  atomRegistry.update(calendarDragSelectionAtom, (dragSelection) => {
    if (!dragSelection || isEqual(dragSelection.secondSelected, secondSelected)) {
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
