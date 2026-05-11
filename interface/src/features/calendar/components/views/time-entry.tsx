import { cn } from "@recount/ui/utils";

import { useDateTimeFormatter } from "~/lib/utils/date-time";

import { getTimeEntryFrameStyle } from "./calendar-multi-day-view/layout";

type TimeEntryInterval = {
  startedAt: Date;
  stoppedAt: Date;
};

interface TimeEntryFrameProps extends React.ComponentProps<"div"> {
  day: Date;
  timeRange: TimeEntryInterval;
  overlap?: { index: number; count: number };
}

export function TimeEntryFrame({
  className,
  day,
  overlap,
  style,
  timeRange,
  ...props
}: TimeEntryFrameProps) {
  return (
    <div
      className={cn("absolute", className)}
      style={{
        ...getTimeEntryFrameStyle({ day, timeRange, overlap }),
        ...style,
      }}
      {...props}
    />
  );
}

interface TimeEntryContentProps extends React.ComponentProps<"div"> {
  timeEntry?: {
    startedAt: Date;
    stoppedAt: Date;
    project: null | {
      name: string;
      color: string;
    };
  };
  variant?: "default" | "preview" | "selection";
}

export function TimeEntryContent({
  className,
  style,
  timeEntry,
  variant = "default",
  ...props
}: TimeEntryContentProps) {
  const formatter = useDateTimeFormatter();

  return (
    <div
      className={cn(
        "flex h-full w-full flex-col overflow-hidden rounded-md bg-primary p-1 text-left",
        variant === "preview" && "opacity-80 ring-2 ring-primary/40",
        variant === "selection" &&
          "rounded-none bg-primary/10 p-0 ring-1 ring-primary/20",
        className
      )}
      style={{
        backgroundColor:
          variant === "selection" ? undefined : timeEntry?.project?.color,
        ...style,
      }}
      {...props}
    >
      <div className="truncate text-sm">{timeEntry?.project?.name}</div>
      {timeEntry && (
        <div className="whitespace-nowrap text-xs tabular-nums">
          <span>{formatter.time(timeEntry.startedAt)}</span> -{" "}
          <span>{formatter.time(timeEntry.stoppedAt)}</span>
        </div>
      )}
    </div>
  );
}
