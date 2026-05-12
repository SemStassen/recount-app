import { useAtomValue } from "@effect/atom-react";
import { endOfDay, isWithinInterval, startOfDay } from "date-fns";

import { sortedDragSelectionAtom } from "../state/atoms";
import { TimeEntryContent, TimeEntryFrame } from "./time-entry";

export function DragSelectionHighlight({ day }: { day: Date }) {
  const dragSelection = useAtomValue(sortedDragSelectionAtom);

  if (!dragSelection) {
    return null;
  }

  const isDragSelectionOverDay = isWithinInterval(day, {
    start: startOfDay(dragSelection.start),
    end: endOfDay(dragSelection.end),
  });

  if (!isDragSelectionOverDay) {
    return null;
  }

  return (
    <TimeEntryFrame
      className="pointer-events-none"
      day={day}
      timeRange={{
        startedAt: dragSelection.start,
        stoppedAt: dragSelection.end,
      }}
    >
      <TimeEntryContent variant="selection" />
    </TimeEntryFrame>
  );
}
