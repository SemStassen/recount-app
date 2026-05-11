import { useAtomValue } from "@effect/atom-react";
import { ScrollArea } from "@recount/ui/scroll-area";
import { useLiveQuery } from "@tanstack/react-db";
import { isSameDay } from "date-fns";

import { useWorkspaceDb } from "~/db/workspace/context";

import {
  calendarCurrentTimeAtom,
  calendarEditingPreviewAtom,
  calendarVisibleDaysAtom,
} from "../../../atoms";
import {
  CALENDAR_DAY_HEADER_HEIGHT_VAR,
  CALENDAR_HEADER_HEIGHT_VAR,
} from "../../../constants";
import { CurrentTimeLine } from "../../views/current-time-line";
import { DayColumn } from "./day-column";
import { Header } from "./header";
import { HourColumn } from "./hour-column";
import { useCalendarTimeEntries } from "./use-calendar-time-entries";

function CalendarMultiDayView() {
  const weekdays = useAtomValue(calendarVisibleDaysAtom);
  const currentTime = useAtomValue(calendarCurrentTimeAtom);
  const preview = useAtomValue(calendarEditingPreviewAtom);
  const workspaceDb = useWorkspaceDb();
  const calendarTimeEntries = useCalendarTimeEntries({
    currentTime,
    replacingTimeEntryId: preview?.replacingTimeEntryId,
  });
  const showCurrentTimeLine = weekdays.some((day) =>
    isSameDay(day, currentTime)
  );

  const { data: projects = [] } = useLiveQuery((q) =>
    q.from({ project: workspaceDb.collections.allProjectsCollection })
  );

  return (
    <div className="flex flex-col">
      {/* Header */}
      <Header weekdays={weekdays} />
      <ScrollArea
        className="[&>div]:overscroll-none"
        style={{
          height: `calc(100vh - var(${CALENDAR_HEADER_HEIGHT_VAR}) - var(${CALENDAR_DAY_HEADER_HEIGHT_VAR}))`,
        }}
      >
        <div className="flex">
          <HourColumn />
          <div
            className="relative grid w-full"
            style={{
              gridTemplateColumns: `repeat(${weekdays.length}, 1fr)`,
            }}
          >
            {weekdays.map((day) => (
              <DayColumn
                currentTime={currentTime}
                day={day}
                key={day.toString()}
                preview={preview}
                projects={projects}
                timeEntries={calendarTimeEntries}
              />
            ))}
            {showCurrentTimeLine ? <CurrentTimeLine /> : null}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export { CalendarMultiDayView };
