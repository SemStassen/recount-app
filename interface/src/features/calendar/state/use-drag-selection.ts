import { useAtom, useAtomSet } from "@effect/atom-react";

import { openCreateTimeEntryEditor } from "~/modules/time";
import type { TimeRange } from "~/modules/time";

import { dragSelectionAtom } from "./atoms";

export function useDragSelection() {
  const [dragSelection, setDragSelection] = useAtom(dragSelectionAtom);
  const openCreateEditor = useAtomSet(openCreateTimeEntryEditor);

  const resetDragSelection = () => setDragSelection(null);

  return {
    startDragSelection(range: TimeRange) {
      setDragSelection(null);
      setDragSelection(range);
    },
    updateDragSelection(range: TimeRange) {
      setDragSelection(range);
    },
    commitDragSelection() {
      if (!dragSelection) {
        return;
      }

      openCreateEditor(dragSelection);
    },
    cancelDragSelection: resetDragSelection,
  };
}
