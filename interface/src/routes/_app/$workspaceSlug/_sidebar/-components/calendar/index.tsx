import { useAtomSet } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";

import { PageTopBar } from "../page";
import { isTimeEntrySidebarOpenAtom } from "./atoms";
import { DateNavigator } from "./components/date-navigator";
import { DndProvider } from "./components/dnd/dnd-provider";
import { OptionsDropdown } from "./components/options-dropdown";
import { TodayButton } from "./components/today-button";
import { CalendarMultiDayView } from "./components/views/calendar-multi-day-view";
import {
  CALENDAR_DAY_HEADER_HEIGHT_VAR,
  CALENDAR_HEADER_HEIGHT_VAR,
  CALENDAR_HOUR_COLUMN_WIDTH_VAR,
  CALENDAR_HOUR_HEIGHT_VAR,
} from "./constants";
import { TimeEntrySidebar } from "./time-entry-sidebar";

function Calendar() {
  const setIsOpen = useAtomSet(isTimeEntrySidebarOpenAtom);

  return (
    <div className="flex flex-row flex-1">
      <div
        className="min-w-0 flex-1 overflow-hidden"
        style={
          {
            [CALENDAR_HEADER_HEIGHT_VAR]: "48px",
            [CALENDAR_DAY_HEADER_HEIGHT_VAR]: "40px",
            [CALENDAR_HOUR_COLUMN_WIDTH_VAR]: "72px",
            [CALENDAR_HOUR_HEIGHT_VAR]: "64px",
          } as React.CSSProperties
        }
      >
        <PageTopBar
          left={
            <>
              <DateNavigator />
              <TodayButton />
            </>
          }
          right={
            <>
              <OptionsDropdown />
              <Button variant="ghost" onClick={() => setIsOpen(true)}>
                <Icons.Plus />
                Add entry
              </Button>
            </>
          }
        />
        <DndProvider>
          <CalendarMultiDayView />
        </DndProvider>
      </div>
      <TimeEntrySidebar />
    </div>
  );
}

export { Calendar };
