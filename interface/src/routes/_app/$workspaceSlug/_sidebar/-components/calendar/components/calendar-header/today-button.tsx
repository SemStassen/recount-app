import { useAtomValue } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { isToday } from "date-fns";

import {
  calendarSelectedDateAtom,
  setCalendarSelectedDate,
} from "~/atoms/calendar.atoms";

function TodayButton() {
  const selectedDate = useAtomValue(calendarSelectedDateAtom);

  return (
    <>
      {!isToday(selectedDate) && (
        <Button
          onClick={() => {
            setCalendarSelectedDate(new Date());
          }}
          variant="ghost"
        >
          Today
        </Button>
      )}
    </>
  );
}

export { TodayButton };
