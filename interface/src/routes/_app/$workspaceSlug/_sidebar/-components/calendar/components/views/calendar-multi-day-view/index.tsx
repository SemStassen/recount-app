import { useAtomValue } from "@effect/atom-react";
import { ScrollArea } from "@recount/ui/scroll-area";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { areIntervalsOverlapping, isSameDay } from "date-fns";
import { DateTime, Option } from "effect";

import { useWorkspaceDb } from "~/db/workspace/context";
import { useDateTimeFormatter } from "~/lib/utils/date-time";

import {
  calendarCurrentTimeAtom,
  calendarVisibleDaysAtom,
} from "../../../atoms";
import {
  CALENDAR_DAY_HEADER_HEIGHT_VAR,
  CALENDAR_HEADER_HEIGHT_VAR,
  CALENDAR_HOUR_COLUMN_WIDTH_VAR,
  CALENDAR_HOUR_HEIGHT_VAR,
  CALENDAR_SLOTS_PER_HOUR,
} from "../../../constants";
import {
  getCalendarSlotDate,
  getTimeEntryBlockStyle,
  groupTimeEntries,
} from "../../../helpers";
import type { ITimeEntry } from "../../../types";
import { useCalendarDragSelection } from "../../../use-calendar-drag-selection";
import { DroppableTimeEntry } from "../../dnd/droppable-time-entry";
import { CurrentTimeLine } from "../../views/current-time-line";
import { DragSelectionHighlight } from "../../views/drag-selection-highlight";
import { TimeEntry } from "../../views/time-entry";
import { Header } from "./header";

const hours = Array.from({ length: 24 }).map((_, hourIndex) => hourIndex);
const timeSlotsPerHour = Array.from({ length: CALENDAR_SLOTS_PER_HOUR }).map(
  (_, timeSlotIndex) => timeSlotIndex
);

function CalendarMultiDayView() {
  const weekdays = useAtomValue(calendarVisibleDaysAtom);
  const currentTime = useAtomValue(calendarCurrentTimeAtom);
  const formatter = useDateTimeFormatter();
  const { startDragSelection } = useCalendarDragSelection();
  const workspaceDb = useWorkspaceDb();

  const { data: timeEntries = [] } = useLiveQuery((q) =>
    q
      .from({ timeEntry: workspaceDb.collections.timeEntriesCollection })
      .innerJoin(
        { project: workspaceDb.collections.allProjectsCollection },
        ({ project, timeEntry }) => eq(project.id, timeEntry.projectId)
      )
  );

  const calendarTimeEntries: Array<ITimeEntry> = timeEntries.map(
    ({ project, timeEntry }) => {
      return {
        id: timeEntry.id,
        project: {
          name: project.name,
          color: project.color,
        },
        startedAt: DateTime.toDate(timeEntry.startedAt),
        stoppedAt: Option.match(timeEntry.stoppedAt, {
          onNone: () => currentTime,
          onSome: DateTime.toDate,
        }),
      };
    }
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
          {/* Hours column */}
          <div
            className="border-r"
            style={{
              width: `var(${CALENDAR_HOUR_COLUMN_WIDTH_VAR})`,
            }}
          >
            {hours.map((hour) => (
              <div
                className="relative"
                key={hour}
                style={{
                  height: `var(${CALENDAR_HOUR_HEIGHT_VAR})`,
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
          {/* Day column */}
          <div
            className="relative grid w-full"
            style={{
              gridTemplateColumns: `repeat(${weekdays.length}, 1fr)`,
            }}
          >
            {weekdays.map((day) => {
              const dayTimeEntries = calendarTimeEntries.filter(
                (timeEntry) =>
                  isSameDay(timeEntry.startedAt, day) ||
                  isSameDay(timeEntry.stoppedAt, day)
              );
              const groupedTimeEntries = groupTimeEntries(dayTimeEntries);

              return (
                <div className="relative" key={day.toString()}>
                  <DragSelectionHighlight day={day} />
                  {hours.map((hour) => (
                    <div
                      className="border-b"
                      key={hour}
                      style={{
                        height: `var(${CALENDAR_HOUR_HEIGHT_VAR})`,
                      }}
                    >
                      {/* Change this for better creation precision */}
                      {/* 4 = 15 min, 6 = 10 min, 12 = 5 min */}
                      {timeSlotsPerHour.map((timeSlotIndex) => {
                        const date = getCalendarSlotDate(
                          day,
                          hour,
                          timeSlotIndex,
                          timeSlotsPerHour.length
                        );
                        const minutes = date.getMinutes();

                        return (
                          <DroppableTimeEntry
                            data-date={date}
                            id={`${day.toString()}-${hour}-${minutes}`}
                            key={timeSlotIndex}
                            onPointerDown={startDragSelection}
                            style={{
                              height: `calc(var(${CALENDAR_HOUR_HEIGHT_VAR}) / ${timeSlotsPerHour.length})`,
                            }}
                          />
                        );
                      })}
                    </div>
                  ))}
                  {groupedTimeEntries.map((group, groupIndex) =>
                    group.map((timeEntry) => {
                      let style = getTimeEntryBlockStyle(
                        timeEntry,
                        day,
                        groupIndex,
                        groupedTimeEntries.length
                      );
                      const hasOverlap = groupedTimeEntries.some(
                        (otherGroup, otherIndex) =>
                          otherIndex !== groupIndex &&
                          otherGroup.some((otherTimeEntry) =>
                            areIntervalsOverlapping(
                              {
                                start: timeEntry.startedAt,
                                end: timeEntry.stoppedAt,
                              },
                              {
                                start: otherTimeEntry.startedAt,
                                end: otherTimeEntry.stoppedAt,
                              }
                            )
                          )
                      );

                      if (!hasOverlap) {
                        style = { ...style, width: "100%", left: "0%" };
                      }

                      return (
                        <div
                          className="absolute p-0.5"
                          key={timeEntry.id}
                          style={style}
                        >
                          <TimeEntry timeEntry={timeEntry} />
                        </div>
                      );
                    })
                  )}
                </div>
              );
            })}
            <CurrentTimeLine />
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export { CalendarMultiDayView };
