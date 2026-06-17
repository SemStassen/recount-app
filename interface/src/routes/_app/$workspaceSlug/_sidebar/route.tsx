import { createFileRoute, Outlet } from "@tanstack/react-router";

import { AskRecountPopover } from "../-components/ask-recount-popover";
import { WorkspaceAppShell } from "./-components/app-shell";
import { NavigationSidebar } from "./-components/navigation-sidebar";
import { NavigationSidebarToggle } from "./-components/navigation-sidebar/navigation-sidebar-toggle";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar")({
  component: Layout,
});

function Layout() {
  return (
    <WorkspaceAppShell
      footer={<AskRecountPopover />}
      sidebar={
        <div className="relative overflow-hidden">
          <NavigationSidebar />
          <div className="absolute top-1.5 left-1.5">
            <NavigationSidebarToggle />
          </div>
        </div>
      }
    >
      <Outlet />
    </WorkspaceAppShell>
  );
}
