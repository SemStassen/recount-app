import { useAtomSet } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";

import { openCreateTimeEntryEditor, TimeEntryEditor } from "~/modules/time";
import { PageTopBar } from "~/routes/_app/$workspaceSlug/_sidebar/-components/page";

import { HOUR_COLUMN_WIDTH_VAR, HOUR_HEIGHT_VAR } from "./constants";
import { DndProvider } from "./dnd/dnd-provider";
import { MultiDayView } from "./multi-day-view";
import { DateNavigator } from "./navigation/date-navigator";
import { OptionsDropdown } from "./navigation/options-dropdown";
import { TodayButton } from "./navigation/today-button";

function Calendar() {
  const openCreateEditor = useAtomSet(openCreateTimeEntryEditor);

  return (
    <div className="flex h-full flex-row overflow-hidden">
      <div
        className="flex min-w-0 flex-1 flex-col overflow-hidden"
        style={
          {
            [HOUR_COLUMN_WIDTH_VAR]: "72px",
            [HOUR_HEIGHT_VAR]: "64px",
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
              <Button
                variant="ghost"
                onClick={() => {
                  openCreateEditor(null);
                }}
              >
                <Icons.Plus />
                Add entry
              </Button>
            </>
          }
        />
        <div className="min-h-0 flex-1">
          <DndProvider>
            <MultiDayView />
          </DndProvider>
        </div>
      </div>
      <TimeEntryEditor />
    </div>
  );
}

export { Calendar };
