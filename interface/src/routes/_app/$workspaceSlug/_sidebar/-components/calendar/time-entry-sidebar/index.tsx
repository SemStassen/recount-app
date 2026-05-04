import { useAtom } from "@effect/atom-react";

import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarHeader,
} from "~/components/sidebar";

import { isTimeEntrySidebarOpenAtom } from "../atoms";
import { CreateTimeEntryForm } from "./create-time-entry-form";

const SIDEBAR_WIDTH = 400;

export function TimeEntrySidebar() {
  const [isOpen, setIsOpen] = useAtom(isTimeEntrySidebarOpenAtom);

  return (
    <Sidebar
      onOpenChange={(open) => setIsOpen(open)}
      open={isOpen}
      side="right"
      width={SIDEBAR_WIDTH}
    >
      <SidebarHeader className="justify-end px-4 pt-3">
        <SidebarClose />
      </SidebarHeader>
      <SidebarContent className="px-4 pb-4">
        <CreateTimeEntryForm />
      </SidebarContent>
    </Sidebar>
  );
}
