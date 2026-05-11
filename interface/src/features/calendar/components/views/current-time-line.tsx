import { useAtomValue } from "@effect/atom-react";

import { useDateTimeFormatter } from "~/lib/utils/date-time";

import { calendarCurrentTimeAtom } from "../../atoms";
import { getCurrentTimePosition } from "./calendar-multi-day-view/layout";

function CurrentTimeLine() {
  const currentTime = useAtomValue(calendarCurrentTimeAtom);
  const formatter = useDateTimeFormatter();

  return (
    <div
      className="pointer-events-none absolute inset-x-0 z-1 border-primary border-t"
      style={{ top: `${getCurrentTimePosition(currentTime)}%` }}
    >
      <div className="-translate-x-1/2 -translate-y-1/2 absolute top-0 left-0 size-3 rounded-full bg-primary" />
      <div className="-left-18 -translate-y-1/2 absolute flex w-16 justify-end bg-background pr-1 font-medium text-primary text-xs">
        {formatter.time(currentTime)}
      </div>
    </div>
  );
}

export { CurrentTimeLine };
