import type { TimeEntryId } from "@recount/core/shared/schemas";

import type { TimeRange } from "../state/time-range";
import { getRangeFromSlots, moveTimeRangeToSlot, type Slot } from "./layout";
import type { TimeEntry } from "./types";

export type Point = { clientX: number; clientY: number };

export function getPointFromEvent(event: Event | undefined): Point | null {
  return event && "clientX" in event && "clientY" in event
    ? { clientX: Number(event.clientX), clientY: Number(event.clientY) }
    : null;
}

export function getRangeKey(range: TimeRange) {
  return `${range.startedAt.getTime()}-${range.stoppedAt.getTime()}`;
}

export function getDropPreviewKey(dropPreview: TimeEntry | null) {
  return dropPreview ? `${dropPreview.id}-${getRangeKey(dropPreview)}` : null;
}

export function getSelectionRange(
  firstSlot: Slot | null,
  currentSlot: Slot | null
) {
  if (!firstSlot || !currentSlot) {
    return null;
  }

  return getRangeFromSlots(firstSlot, currentSlot);
}

export function getMovedTimeEntryPreview({
  slot,
  timeEntryId,
  timeRange,
}: {
  slot: Slot | null;
  timeEntryId: TimeEntryId;
  timeRange: Pick<TimeEntry, "startedAt" | "stoppedAt" | "project">;
}): TimeEntry | null {
  if (!slot) {
    return null;
  }

  return {
    id: String(timeEntryId),
    project: timeRange.project,
    ...moveTimeRangeToSlot(timeRange, slot),
  };
}
