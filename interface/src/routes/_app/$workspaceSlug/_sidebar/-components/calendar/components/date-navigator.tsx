import { useAtom } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Calendar } from "@recount/ui/calendar";
import { Icons } from "@recount/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@recount/ui/popover";
import { addDays, subDays } from "date-fns";

import { atomRegistry } from "~/atoms/registry";
import { useDateTimeFormatter } from "~/lib/utils/date-time";

import { calendarDaysInViewAtom, calendarSelectedDateAtom } from "../atoms";

function DateNavigator() {
  const [selectedDate, setSelectedDate] = useAtom(calendarSelectedDateAtom);
  const formatter = useDateTimeFormatter();

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
              {formatter.monthYear(selectedDate)}
            </Button>
          )}
        />
        <PopoverContent className="w-fit p-0">
          <Calendar
            mode="single"
            onSelect={(date) => date && setSelectedDate(date)}
            selected={selectedDate}
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
