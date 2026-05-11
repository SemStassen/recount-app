import { isEqual } from "date-fns";

import { atomRegistry } from "~/atoms/registry";

import { closeTimeEntryEditor, openCreateTimeEntryEditor } from "./actions";
import { calendarDragSelectionAtom, sortDragSelection } from "./atoms";

function resetDragSelection() {
  atomRegistry.set(calendarDragSelectionAtom, null);
}

function setDragSelectionFirst(firstSelected: Date) {
  atomRegistry.set(calendarDragSelectionAtom, {
    firstSelected,
    secondSelected: firstSelected,
  });
}

function setDragSelectionSecond(secondSelected: Date) {
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

function commitDragSelection() {
  const dragSelection = atomRegistry.get(calendarDragSelectionAtom);
  const sortedSelection = sortDragSelection(dragSelection);

  if (!sortedSelection) {
    return;
  }

  openCreateTimeEntryEditor({
    startedAt: sortedSelection.start,
    stoppedAt: sortedSelection.end,
  });
  resetDragSelection();
}

export function useCalendarDragSelection() {
  return {
    startDragSelection() {
      resetDragSelection();
      closeTimeEntryEditor();

      const handlePointerMove = (event: PointerEvent) => {
        const dataDate = (event.target as HTMLElement).dataset.date;
        if (!dataDate) {
          return;
        }

        if (atomRegistry.get(calendarDragSelectionAtom)?.firstSelected) {
          setDragSelectionSecond(new Date(dataDate));
        } else {
          setDragSelectionFirst(new Date(dataDate));
        }
      };

      const handlePointerUp = () => {
        commitDragSelection();
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
  };
}
