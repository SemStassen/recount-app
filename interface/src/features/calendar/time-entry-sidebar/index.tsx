import { useAtom, useAtomSet } from "@effect/atom-react";

import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarHeader,
} from "~/components/sidebar";

import { calendarEditorAtom, closeTimeEntryEditor } from "../atoms";
import { CreateTimeEntryForm } from "./create-time-entry-form";
import { UpdateTimeEntryForm } from "./update-time-entry-form";

const SIDEBAR_WIDTH = 400;

export function TimeEntrySidebar() {
  const [editor] = useAtom(calendarEditorAtom);
  const closeEditor = useAtomSet(closeTimeEntryEditor);

  return (
    <Sidebar
      onOpenChange={(open) => {
        if (!open) {
          closeEditor();
        }
      }}
      open={editor !== null}
      side="right"
      width={SIDEBAR_WIDTH}
    >
      <SidebarHeader className="justify-end px-4 pt-3">
        <SidebarClose />
      </SidebarHeader>
      <SidebarContent className="px-4 pb-4">
        {editor?.mode === "create" && (
          <CreateTimeEntryForm initialRange={editor.initialRange} />
        )}
        {editor?.mode === "update" && (
          <UpdateTimeEntryForm
            initialRange={editor.initialRange}
            timeEntryId={editor.timeEntryId}
          />
        )}
      </SidebarContent>
    </Sidebar>
  );
}
