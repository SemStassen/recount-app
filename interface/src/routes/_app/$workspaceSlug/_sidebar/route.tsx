import { createFileRoute, Outlet } from "@tanstack/react-router";

import { NavigationSidebar } from "./-components/navigation-sidebar/navigation-sidebar";
import { NavigationSidebarToggle } from "./-components/navigation-sidebar/navigation-sidebar-toggle";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar")({
  component: Layout,
});

function Layout() {
  return (
    <>
      <div className="relative">
        <NavigationSidebar />
        <div className="absolute top-1.5 left-1.5">
          <NavigationSidebarToggle />
        </div>
      </div>
      <Outlet />
    </>
  );
}
