import { Atom } from "effect/unstable/reactivity";

import type { TimeRange } from "~/modules/time";

import { getVisibleDays } from "./view-state";

export { currentTimeAtom } from "~/atoms/current-time.atom";

type DragSelection = TimeRange | null;

export const daysInViewAtom = Atom.make<number>(7);
export const selectedDateAtom = Atom.make(new Date());
export const dragSelectionAtom = Atom.make<DragSelection>(null);

export const visibleDaysAtom = Atom.transform(
  selectedDateAtom,
  (get, dateAtom) => getVisibleDays(get(dateAtom), get(daysInViewAtom))
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
