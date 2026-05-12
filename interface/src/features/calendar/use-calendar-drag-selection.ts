import { useAtomSet } from "@effect/atom-react";

import { atomRegistry } from "~/atoms/registry";

import { calendarDragSelectionAtom, openCreateTimeEntryEditor } from "./atoms";

type TimeRange = {
  startedAt: Date;
  stoppedAt: Date;
};

function resetDragSelection() {
  atomRegistry.set(calendarDragSelectionAtom, null);
}

export function useCalendarDragSelection() {
  const openCreateEditor = useAtomSet(openCreateTimeEntryEditor);

  return {
    startDragSelection(range: TimeRange) {
      resetDragSelection();
      atomRegistry.set(calendarDragSelectionAtom, range);
    },
    updateDragSelection(range: TimeRange) {
      atomRegistry.set(calendarDragSelectionAtom, range);
    },
    commitDragSelection() {
      const dragSelection = atomRegistry.get(calendarDragSelectionAtom);

      if (!dragSelection) {
        return;
      }

      openCreateEditor(dragSelection);
    },
    cancelDragSelection: resetDragSelection,
  };
}
