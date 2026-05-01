import { useAtomValue } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";

import { PageTopBar } from "../page";
import { calendarViewAtom } from "./atoms";
import { DateNavigator } from "./components/calendar-header/date-navigator";
import { OptionsDropdown } from "./components/calendar-header/options-dropdown";
import { TodayButton } from "./components/calendar-header/today-button";
import { DndProvider } from "./components/dnd/dnd-provider";
import { CalendarMultiDayView } from "./components/views/calendar-multi-day-view";
import {
  CALENDAR_DAY_HEADER_HEIGHT_VAR,
  CALENDAR_HEADER_HEIGHT_VAR,
  CALENDAR_HOUR_COLUMN_WIDTH_VAR,
  CALENDAR_HOUR_HEIGHT_VAR,
} from "./constants";
import { RightSidebar } from "./right-sidebar";

function Calendar() {
  const view = useAtomValue(calendarViewAtom);

  return (
    <div className="flex flex-1">
      <div
        className="w-full overflow-hidden"
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
              <Button variant="ghost">
                <Icons.Plus />
                Add entry (NI)
              </Button>
            </>
          }
        />
        <DndProvider>{view === "days" && <CalendarMultiDayView />}</DndProvider>
      </div>
      <div className="relative">
        <RightSidebar />
      </div>
    </div>
  );
}

export { Calendar };
