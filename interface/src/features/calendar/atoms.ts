import type { TimeEntryId } from "@recount/core/shared/schemas";
import { Atom } from "effect/unstable/reactivity";

import { currentTimeAtom } from "~/atoms/current-time.atom";

import { getVisibleDays } from "./helpers";

type TimeRange = {
  startedAt: Date;
  stoppedAt: Date;
};

type CalendarDragSelection = TimeRange | null;

type CalendarEditorState =
  | null
  | {
      mode: "create";
      initialRange: TimeRange | null;
    }
  | {
      mode: "update";
      timeEntryId: TimeEntryId;
      initialRange?: TimeRange;
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

export const openCreateTimeEntryEditor = Atom.fnSync(
  (initialRange: TimeRange | null, context) => {
    context.set(calendarEditingPreviewAtom, null);
    context.set(calendarEditorAtom, { mode: "create", initialRange });
  }
);

export const openUpdateTimeEntryEditor = Atom.fnSync(
  (input: { timeEntryId: TimeEntryId; initialRange?: TimeRange }, context) => {
    context.set(calendarDragSelectionAtom, null);
    context.set(calendarEditingPreviewAtom, null);
    context.set(calendarEditorAtom, {
      mode: "update",
      timeEntryId: input.timeEntryId,
      initialRange: input.initialRange,
    });
  }
);

export const closeTimeEntryEditor = Atom.fnSync((_: void, context) => {
  context.set(calendarDragSelectionAtom, null);
  context.set(calendarEditorAtom, null);
  context.set(calendarEditingPreviewAtom, null);
});

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

  return dragSelection.startedAt < dragSelection.stoppedAt
    ? {
        start: dragSelection.startedAt,
        end: dragSelection.stoppedAt,
      }
    : {
        start: dragSelection.stoppedAt,
        end: dragSelection.startedAt,
      };
}
