import { useAtomSet } from "@effect/atom-react";

import { atomRegistry } from "~/atoms/registry";

import { dragSelectionAtom, openCreateTimeEntryEditor } from "./atoms";
import type { TimeRange } from "./time-range";

function resetDragSelection() {
  atomRegistry.set(dragSelectionAtom, null);
}

export function useDragSelection() {
  const openCreateEditor = useAtomSet(openCreateTimeEntryEditor);

  return {
    startDragSelection(range: TimeRange) {
      resetDragSelection();
      atomRegistry.set(dragSelectionAtom, range);
    },
    updateDragSelection(range: TimeRange) {
      atomRegistry.set(dragSelectionAtom, range);
    },
    commitDragSelection() {
      const dragSelection = atomRegistry.get(dragSelectionAtom);

      if (!dragSelection) {
        return;
      }

      openCreateEditor(dragSelection);
    },
    cancelDragSelection: resetDragSelection,
  };
}
