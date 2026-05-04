import { useAtom } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { isToday } from "date-fns";

import { calendarSelectedDateAtom } from "../atoms";

function TodayButton() {
  const [selectedDate, setSelectedDate] = useAtom(calendarSelectedDateAtom);

  return (
    <>
      {!isToday(selectedDate) && (
        <Button
          onClick={() => {
            setSelectedDate(new Date());
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
