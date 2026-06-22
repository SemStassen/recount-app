import { useAtom, useAtomValue } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Calendar } from "@recount/ui/calendar";
import { Icons } from "@recount/ui/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@recount/ui/popover";

import { WEEK_STARTS_ON } from "../constants";
import {
  daysInViewAtom,
  selectedDateAtom,
  visibleDaysAtom,
} from "../state/atoms";
import {
  getSelectedDateFromPicker,
  getVisibleRangeLabel,
  getNextPeriod,
  getPreviousPeriod,
} from "../state/view-state";

export function DateNavigator() {
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);
  const daysInView = useAtomValue(daysInViewAtom);
  const visibleDays = useAtomValue(visibleDaysAtom);
  const visibleRangeLabel = getVisibleRangeLabel(visibleDays);

  const selectDate = (date: Date | undefined) => {
    if (!date) {
      return;
    }

    const nextSelectedDate = getSelectedDateFromPicker({
      date,
      daysInView,
    });

    if (nextSelectedDate) {
      setSelectedDate(nextSelectedDate);
    }
  };

  const goToPreviousPeriod = () => {
    setSelectedDate((currentSelectedDate) =>
      getPreviousPeriod(currentSelectedDate, daysInView)
    );
  };

  const goToNextPeriod = () => {
    setSelectedDate((currentSelectedDate) =>
      getNextPeriod(currentSelectedDate, daysInView)
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
            weekStartsOn={WEEK_STARTS_ON}
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
