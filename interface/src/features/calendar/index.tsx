import { useAtomSet } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";

import { PageTopBar } from "~/routes/_app/$workspaceSlug/_sidebar/-components/page";

import {
  DAY_HEADER_HEIGHT_VAR,
  HEADER_HEIGHT_VAR,
  HOUR_COLUMN_WIDTH_VAR,
  HOUR_HEIGHT_VAR,
} from "./constants";
import { DndProvider } from "./dnd/dnd-provider";
import { MultiDayView } from "./multi-day-view";
import { DateNavigator } from "./navigation/date-navigator";
import { OptionsDropdown } from "./navigation/options-dropdown";
import { TodayButton } from "./navigation/today-button";
import { openCreateTimeEntryEditor } from "./state/atoms";
import { TimeEntryEditor } from "./time-entry-editor";

function Calendar() {
  const openCreateEditor = useAtomSet(openCreateTimeEntryEditor);

  return (
    <div className="flex flex-row flex-1">
      <div
        className="min-w-0 flex-1 overflow-hidden"
        style={
          {
            [HEADER_HEIGHT_VAR]: "48px",
            [DAY_HEADER_HEIGHT_VAR]: "40px",
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
        <DndProvider>
          <MultiDayView />
        </DndProvider>
      </div>
      <TimeEntryEditor />
    </div>
  );
}

export { Calendar };
