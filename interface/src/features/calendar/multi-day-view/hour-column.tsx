import { useDateTimeFormatter } from "~/lib/utils/date-time/hooks";

import { HOUR_COLUMN_WIDTH_VAR, HOUR_HEIGHT_VAR } from "../constants";

const hours = Array.from({ length: 24 }).map((_, hourIndex) => hourIndex);

export function HourColumn() {
  const formatter = useDateTimeFormatter();

  return (
    <div
      className="border-r"
      style={{
        width: `var(${HOUR_COLUMN_WIDTH_VAR})`,
      }}
    >
      {hours.map((hour) => (
        <div
          className="relative"
          key={hour}
          style={{
            height: `var(${HOUR_HEIGHT_VAR})`,
          }}
        >
          {hour !== 0 && (
            <span className="-translate-y-1/2 -translate-x-1/2 absolute left-1/2">
              {formatter.time(new Date(0, 0, 0, hour))}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}
