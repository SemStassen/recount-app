import { DragOverlay } from "@dnd-kit/react";
import { useAtomValue } from "@effect/atom-react";

import { calendarSortedDragSelectionAtom } from "../../../atoms";
import { isTimeEntryDragData } from "../../dnd/types";
import { TimeEntryContent } from "../time-entry";

export function CalendarDragOverlay() {
  const dragSelection = useAtomValue(calendarSortedDragSelectionAtom);

  return (
    <DragOverlay
      className="pointer-events-none fixed left-0 top-0 z-50"
      dropAnimation={null}
    >
      {(source) => {
        if (source.data.kind === "calendar-selection" && dragSelection) {
          return (
            <div className="pointer-events-none w-36 overflow-hidden rounded-md border border-primary/30 bg-background/95 p-1.5 shadow-lg backdrop-blur-sm">
              <TimeEntryContent
                className="min-h-10 rounded-sm px-2 py-1 shadow-none"
                timeEntry={{
                  startedAt: dragSelection.start,
                  stoppedAt: dragSelection.end,
                  project: null,
                }}
                variant="selection"
              />
            </div>
          );
        }

        if (!isTimeEntryDragData(source.data)) {
          return null;
        }

        return (
          <div className="pointer-events-none h-full w-56 p-0.5 drop-shadow-xl">
            <TimeEntryContent
              className="opacity-95 ring-2 ring-background/80"
              timeEntry={source.data.timeRange}
            />
          </div>
        );
      }}
    </DragOverlay>
  );
}
