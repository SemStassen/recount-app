import { useAtom, useAtomValue } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Calendar } from "@recount/ui/calendar";
import { Icons } from "@recount/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@recount/ui/popover";
import {
  addDays,
  format,
  isSameDay,
  isSameMonth,
  startOfWeek,
  subDays,
} from "date-fns";

import { atomRegistry } from "~/atoms/registry";

import {
  calendarDaysInViewAtom,
  calendarSelectedDateAtom,
  calendarVisibleDaysAtom,
} from "../atoms";
import { CALENDAR_WEEK_STARTS_ON } from "../constants";

function getVisibleRangeLabel(visibleDays: Array<Date>) {
  const firstDay = visibleDays[0];
  const lastDay = visibleDays.at(-1);

  if (!firstDay || !lastDay) {
    return "";
  }

  if (isSameMonth(firstDay, lastDay)) {
    return `${format(firstDay, "MMM")} ${format(lastDay, "yyyy")}`;
  }

  return `${format(firstDay, "MMM")} / ${format(lastDay, "MMM")} ${format(lastDay, "yy")}`;
}

function DateNavigator() {
  const [selectedDate, setSelectedDate] = useAtom(calendarSelectedDateAtom);
  const daysInView = useAtomValue(calendarDaysInViewAtom);
  const visibleDays = useAtomValue(calendarVisibleDaysAtom);
  const visibleRangeLabel = getVisibleRangeLabel(visibleDays);

  const selectDate = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    setSelectedDate(
      daysInView === 1
        ? date
        : startOfWeek(date, { weekStartsOn: CALENDAR_WEEK_STARTS_ON })
    );
  };

  const goToPreviousPeriod = () => {
    atomRegistry.update(calendarSelectedDateAtom, (selectedDate) =>
      subDays(selectedDate, atomRegistry.get(calendarDaysInViewAtom))
    );
  };

  const goToNextPeriod = () => {
    atomRegistry.update(calendarSelectedDateAtom, (selectedDate) =>
      addDays(selectedDate, atomRegistry.get(calendarDaysInViewAtom))
    );
  };

  return (
    <>
      <Popover>
        <PopoverTrigger
          render={(props) => (
            <Button variant="ghost" {...props}>
              {visibleRangeLabel}
            </Button>
          )}
        />
        <PopoverContent className="w-fit p-0">
          <Calendar
            mode="single"
            onSelect={selectDate}
            selected={selectedDate}
            weekStartsOn={CALENDAR_WEEK_STARTS_ON}
          />
        </PopoverContent>
      </Popover>
      <div>
        <Button onClick={goToPreviousPeriod} size="icon" variant="ghost">
          <Icons.ChevronLeft />
        </Button>
        <Button onClick={goToNextPeriod} size="icon" variant="ghost">
          <Icons.ChevronRight />
        </Button>
      </div>
    </>
  );
}

export { DateNavigator };
