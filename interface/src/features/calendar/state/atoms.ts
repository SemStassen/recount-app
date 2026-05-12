import type { TimeEntryId } from "@recount/core/shared/schemas";
import { Atom } from "effect/unstable/reactivity";

import type { TimeRange } from "./time-range";
import { getVisibleDays } from "./view-state";

export { currentTimeAtom } from "~/atoms/current-time.atom";

type DragSelection = TimeRange | null;

type EditorState =
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

export type EditingPreview = null | {
  startedAt: Date;
  stoppedAt: Date | null;
  projectId: string | null;
  replacingTimeEntryId: TimeEntryId | null;
};

export const daysInViewAtom = Atom.make<number>(7);
export const selectedDateAtom = Atom.make(new Date());
export const dragSelectionAtom = Atom.make<DragSelection>(null);
export const editorAtom = Atom.make<EditorState>(null);
export const editingPreviewAtom = Atom.make<EditingPreview>(null);

export const openCreateTimeEntryEditor = Atom.fnSync(
  (initialRange: TimeRange | null, context) => {
    context.set(editingPreviewAtom, null);
    context.set(editorAtom, { mode: "create", initialRange });
  }
);

export const openUpdateTimeEntryEditor = Atom.fnSync(
  (input: { timeEntryId: TimeEntryId; initialRange?: TimeRange }, context) => {
    context.set(dragSelectionAtom, null);
    context.set(editingPreviewAtom, null);
    context.set(editorAtom, {
      mode: "update",
      timeEntryId: input.timeEntryId,
      initialRange: input.initialRange,
    });
  }
);

export const closeTimeEntryEditor = Atom.fnSync((_: void, context) => {
  context.set(dragSelectionAtom, null);
  context.set(editorAtom, null);
  context.set(editingPreviewAtom, null);
});

export const visibleDaysAtom = Atom.transform(
  selectedDateAtom,
  (get, selectedDateAtom) =>
    getVisibleDays(get(selectedDateAtom), get(daysInViewAtom))
);

export const sortedDragSelectionAtom = Atom.map(
  dragSelectionAtom,
  sortDragSelection
);

export function sortDragSelection(dragSelection: DragSelection) {
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
