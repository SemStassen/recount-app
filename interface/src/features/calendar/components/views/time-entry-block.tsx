import { cn } from "@recount/ui/utils";

import { useDateTimeFormatter } from "~/lib/utils/date-time";

interface TimeEntryBlockProps extends React.ComponentProps<"div"> {
  timeEntry: {
    startedAt: Date;
    stoppedAt: Date;
    project: null | {
      name: string;
      color: string;
    };
  };
  variant?: "default" | "preview";
}

export function TimeEntryBlock({
  className,
  style,
  timeEntry,
  variant = "default",
  ...props
}: TimeEntryBlockProps) {
  const formatter = useDateTimeFormatter();

  return (
    <div
      className={cn(
        "flex w-full flex-col overflow-hidden rounded-md bg-primary p-1 text-left",
        variant === "preview" && "opacity-80 ring-2 ring-primary/40",
        className
      )}
      style={{
        backgroundColor: timeEntry.project?.color,
        ...style,
      }}
      {...props}
    >
      <div className="truncate text-sm">{timeEntry.project?.name}</div>
      <div className="whitespace-nowrap text-xs tabular-nums">
        <span>{formatter.time(timeEntry.startedAt)}</span> -{" "}
        <span>{formatter.time(timeEntry.stoppedAt)}</span>
      </div>
    </div>
  );
}
