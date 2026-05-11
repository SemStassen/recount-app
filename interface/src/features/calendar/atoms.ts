import type { TimeEntryId } from "@recount/core/shared/schemas";
import { Atom } from "effect/unstable/reactivity";

import { currentTimeAtom } from "~/atoms/current-time.atom";

import { getVisibleDays } from "./helpers";

type CalendarDragSelection = {
  firstSelected: Date;
  secondSelected: Date;
} | null;

type TimeRange = {
  startedAt: Date;
  stoppedAt: Date;
};

type CalendarEditorState =
  | null
  | {
      mode: "create";
      initialRange: TimeRange | null;
    }
  | {
      mode: "update";
      timeEntryId: TimeEntryId;
    };

export type CalendarEditingPreview = null | {
  startedAt: Date;
  stoppedAt: Date | null;
  projectId: string | null;
  replacingTimeEntryId: TimeEntryId | null;
};

export const calendarDaysInViewAtom = Atom.make<number>(7);
export const calendarSelectedDateAtom = Atom.make(new Date());
export const calendarCurrentTimeAtom = currentTimeAtom;
export const calendarDragSelectionAtom = Atom.make<CalendarDragSelection>(null);
export const calendarEditorAtom = Atom.make<CalendarEditorState>(null);
export const calendarEditingPreviewAtom =
  Atom.make<CalendarEditingPreview>(null);

export const calendarVisibleDaysAtom = Atom.transform(
  calendarSelectedDateAtom,
  (get, selectedDateAtom) =>
    getVisibleDays(get(selectedDateAtom), get(calendarDaysInViewAtom))
);

export const calendarSortedDragSelectionAtom = Atom.map(
  calendarDragSelectionAtom,
  sortDragSelection
);

export function sortDragSelection(dragSelection: CalendarDragSelection) {
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
