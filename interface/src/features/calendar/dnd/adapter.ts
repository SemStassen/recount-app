import type { TimeEntryId } from "@recount/core/shared/schemas";

import type { TimeEntry } from "../multi-day-view/types";
import type { TimeEntryDragData } from "./types";

type DragSource = {
  id?: unknown;
  data: unknown;
};

type DraggedTimeEntry = {
  timeEntryId: TimeEntryId;
  timeRange: Pick<TimeEntry, "startedAt" | "stoppedAt" | "project">;
};

export function getDraggedTimeEntry(
  source: DragSource | null | undefined
): DraggedTimeEntry | null {
  if (!source?.id || !isTimeEntryDragData(source.data)) {
    return null;
  }

  return {
    timeEntryId: source.id as TimeEntryId,
    timeRange: source.data.timeRange,
  };
}

function isTimeEntryDragData(data: unknown): data is TimeEntryDragData {
  return (
    typeof data === "object" &&
    data !== null &&
    "kind" in data &&
    data.kind === "time-entry" &&
    "timeRange" in data
  );
}
