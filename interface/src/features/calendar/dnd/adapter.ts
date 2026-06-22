import type { TimeEntryId } from "@recount/core/shared/schemas";

import type { TimeEntryDragData } from "./types";

interface DragSource {
  id?: unknown;
  data: unknown;
}

interface DraggedTimeEntry {
  timeEntryId: TimeEntryId;
  timeRange: TimeEntryDragData["timeRange"];
}

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
