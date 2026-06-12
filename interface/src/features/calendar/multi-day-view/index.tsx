import { useAtomValue } from "@effect/atom-react";
import { ScrollArea } from "@recount/ui/scroll-area";
import { useLiveQuery } from "@tanstack/react-db";
import { isSameDay } from "date-fns";

import { useWorkspaceDb } from "~/db/workspace/context";

import { DAY_HEADER_HEIGHT_VAR, HEADER_HEIGHT_VAR } from "../constants";
import {
  currentTimeAtom,
  editingPreviewAtom,
  visibleDaysAtom,
} from "../state/atoms";
import { Grid } from "./grid";
import { Header } from "./header";
import { HourColumn } from "./hour-column";
import { useTimeEntries } from "./use-time-entries";

function MultiDayView() {
  const weekdays = useAtomValue(visibleDaysAtom);
  const currentTime = useAtomValue(currentTimeAtom);
  const preview = useAtomValue(editingPreviewAtom);
  const workspaceDb = useWorkspaceDb();
  const timeEntries = useTimeEntries({
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
      <Header weekdays={weekdays} />
      <ScrollArea
        className="[&>div]:overscroll-y-none"
        style={{
          height: `calc(100vh - var(${HEADER_HEIGHT_VAR}) - var(${DAY_HEADER_HEIGHT_VAR}))`,
        }}
      >
        <div className="flex">
          <HourColumn />
          <Grid
            currentTime={currentTime}
            preview={preview}
            projects={projects}
            showCurrentTimeLine={showCurrentTimeLine}
            timeEntries={timeEntries}
            weekdays={weekdays}
          />
        </div>
      </ScrollArea>
    </div>
  );
}

export { MultiDayView };
