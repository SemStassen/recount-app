import { useAtom } from "@effect/atom-react";

import {
  Sidebar,
  SidebarClose,
  SidebarContent,
  SidebarHeader,
} from "~/components/sidebar";
import { useRegisterCommands } from "~/features/command-menu";

import { isCreateProjectSidebarOpenAtom } from "./atoms";
import { CreateProjectForm } from "./create-project-form";

const SIDEBAR_WIDTH = 450;

export function CreateProjectSidebar() {
  const [isOpen, setIsOpen] = useAtom(isCreateProjectSidebarOpenAtom);

  useRegisterCommands(
    [
      {
        id: "navigation.toggle-create-project-sidebar",
        title: isOpen ? "Close new project" : "Create new project",
        perform: ({ close }) => {
          setIsOpen((o) => !o);
          close();
        },
        category: "navigation",
      },
    ],
    {
      id: "project-sidebar",
    }
  );

  return (
    <Sidebar
      onOpenChange={(open) => setIsOpen(open)}
      open={isOpen}
      side="right"
      width={SIDEBAR_WIDTH}
    >
      <SidebarContent className="px-4 pt-3 pb-4">
        <SidebarHeader className="justify-end">
          <SidebarClose />
        </SidebarHeader>
        <CreateProjectForm />
      </SidebarContent>
    </Sidebar>
  );
}
