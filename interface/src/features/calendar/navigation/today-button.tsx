import { useAtom } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { isToday } from "date-fns";

import { selectedDateAtom } from "../state/atoms";

export function TodayButton() {
  const [selectedDate, setSelectedDate] = useAtom(selectedDateAtom);

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
