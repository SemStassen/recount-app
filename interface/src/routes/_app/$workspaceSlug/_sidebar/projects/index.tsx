import { useAtomSet } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { createFileRoute } from "@tanstack/react-router";

import { projectSidebarAtom } from "~/atoms/ui-atoms";

import { ProjectSidebar } from "./-components/project-sidebar";
import { ProjectsList } from "./-components/projects-list";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/projects/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const setProjectSidebar = useAtomSet(projectSidebarAtom);

  return (
    <>
      <div className="flex flex-col flex-1">
        <header className="flex flex-row items-center justify-between py-2 px-4">
          {/* Breadcrumb */}
          <div>
            <span>Projects</span>
          </div>
          <Button
            variant="ghost"
            onClick={() => setProjectSidebar({ mode: "create" })}
          >
            <Icons.Plus /> New project
          </Button>
        </header>
        <ProjectsList />
      </div>
      <ProjectSidebar />
    </>
  );
}
