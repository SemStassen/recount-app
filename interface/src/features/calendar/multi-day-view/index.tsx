import { useAtomValue } from "@effect/atom-react";
import { ScrollArea } from "@recount/ui/scroll-area";
import { useLiveQuery } from "@tanstack/react-db";
import { isSameDay } from "date-fns";

import { editingPreviewAtom, useTimeEntries } from "~/modules/time";
import { useWorkspaceDb } from "~/modules/workspace";

import { currentTimeAtom, visibleDaysAtom } from "../state/atoms";
import { Grid } from "./grid";
import { Header } from "./header";
import { HourColumn } from "./hour-column";

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
    <div className="flex h-full flex-col overflow-hidden">
      <Header weekdays={weekdays} />
      <ScrollArea className="min-h-0 flex-1 [&>div]:overscroll-y-none">
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
