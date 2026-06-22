import { isSameDay } from "date-fns";

import type { TimeRange } from "~/modules/time";

import { TimeEntryFrame } from "./time-entry";

interface TimeEntryDropPreviewValue extends TimeRange {
  id: string;
}

export function TimeEntryDropPreview({
  day,
  timeEntry,
}: {
  day: Date;
  timeEntry: TimeEntryDropPreviewValue | null;
}) {
  if (
    !timeEntry ||
    !(
      isSameDay(timeEntry.startedAt, day) || isSameDay(timeEntry.stoppedAt, day)
    )
  ) {
    return null;
  }

  return (
    <TimeEntryFrame
      className="pointer-events-none p-0.5"
      day={day}
      timeRange={timeEntry}
    >
      <div className="h-full w-full rounded-md border-2 border-primary/70 bg-primary/5 shadow-[0_0_0_1px_hsl(var(--background))]" />
    </TimeEntryFrame>
  );
}
