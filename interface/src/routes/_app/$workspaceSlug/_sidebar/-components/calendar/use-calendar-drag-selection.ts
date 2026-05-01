import { useEffect } from "react";

import { atomRegistry } from "~/atoms/registry";

import {
  calendarDragSelectionAtom,
  commitDragSelection,
  resetCreateTimeEntrySelection,
  resetDragSelection,
  setDragSelectionFirst,
  setDragSelectionSecond,
  setIsDragSelectionActive,
} from "./atoms";

export function useCalendarDragSelection() {
  useEffect(() => {
    return () => {
      setIsDragSelectionActive(false);
      resetDragSelection();
    };
  }, []);

  return {
    startDragSelection() {
      resetDragSelection();
      resetCreateTimeEntrySelection();
      setIsDragSelectionActive(true);

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
        setIsDragSelectionActive(false);
        window.removeEventListener("pointermove", handlePointerMove);
        window.removeEventListener("pointerup", handlePointerUp);
      };

      window.addEventListener("pointermove", handlePointerMove);
      window.addEventListener("pointerup", handlePointerUp);
    },
  };
}
