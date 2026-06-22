import { useAtomValue } from "@effect/atom-react";
import { cn } from "@recount/ui/utils";
import { isSameDay } from "date-fns";

import { useDateTimeFormatter } from "~/lib/utils/date-time/hooks";

import { HOUR_COLUMN_WIDTH_VAR } from "../constants";
import { currentTimeAtom } from "../state/atoms";

function Header({ weekdays }: { weekdays: Array<Date> }) {
  const currentTime = useAtomValue(currentTimeAtom);
  const formatter = useDateTimeFormatter();

  return (
    <div
      className="flex h-10 shrink-0 items-center justify-center border-b"
      style={{
        paddingLeft: `var(${HOUR_COLUMN_WIDTH_VAR})`,
      }}
    >
      <div
        className="grid flex-1"
        style={{
          gridTemplateColumns: `repeat(${weekdays.length}, 1fr)`,
        }}
      >
        {weekdays.map((day) => {
          const isCurrentDay = isSameDay(day, currentTime);

          return (
            <div
              className={cn(
                "flex items-center justify-center gap-1",
                isCurrentDay ? "text-foreground" : "text-muted-foreground"
              )}
              key={day.toString()}
            >
              <span>{formatter.weekdayShort(day)}</span>
              <span
                className={cn(
                  "rounded-md px-1",
                  isCurrentDay && "bg-primary text-primary-foreground"
                )}
              >
                {formatter.day(day)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export { Header };
