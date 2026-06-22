import type { TimeEntryId } from "@recount/core/shared/schemas";

import type { TimeRange } from "~/modules/time";

import type { Slot } from "./layout";
import { getRangeFromSlots, moveTimeRangeToSlot } from "./layout";

export interface Point {
  clientX: number;
  clientY: number;
}

interface TimeEntryDropPreview extends TimeRange {
  id: string;
  project: null | {
    name: string;
    color: string;
  };
}

export function getPointFromEvent(event: Event | undefined): Point | null {
  return event && "clientX" in event && "clientY" in event
    ? { clientX: Number(event.clientX), clientY: Number(event.clientY) }
    : null;
}

export function getRangeKey(range: TimeRange) {
  return `${range.startedAt.getTime()}-${range.stoppedAt.getTime()}`;
}

export function getDropPreviewKey(dropPreview: TimeEntryDropPreview | null) {
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
  timeRange: TimeRange & Pick<TimeEntryDropPreview, "project">;
}): TimeEntryDropPreview | null {
  if (!slot) {
    return null;
  }

  return {
    id: timeEntryId,
    project: timeRange.project,
    ...moveTimeRangeToSlot(timeRange, slot),
  };
}
