import { useAtom, useAtomSet } from "@effect/atom-react";

import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarHeader,
} from "~/components/sidebar";

import { editorAtom, closeTimeEntryEditor } from "../state/atoms";
import { CreateTimeEntryForm } from "./create-form";
import { UpdateTimeEntryForm } from "./update-form";

const SIDEBAR_WIDTH = 400;

export function TimeEntryEditor() {
  const [editor] = useAtom(editorAtom);
  const closeEditor = useAtomSet(closeTimeEntryEditor);

  return (
    <Sidebar
      onOpenChange={(open) => {
        if (!open) {
          closeEditor(undefined);
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
