import { useAtomSet } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { createFileRoute } from "@tanstack/react-router";

import { projectSidebarAtom } from "~/atoms/ui-atoms";
import { useWorkspaceLiveQuery } from "~/db/use-workspace-live-query";

import { ProjectSidebar } from "./-components/project-sidebar";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/projects/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const setProjectSidebar = useAtomSet(projectSidebarAtom);

  const { data: projects } = useWorkspaceLiveQuery((q, db) =>
    q.from({ project: db.projectsCollection })
  );

  return (
    <>
      <div className="flex flex-col flex-1">
        <header className="flex flex-row items-end justify-end">
          <Button
            variant="ghost"
            onClick={() => setProjectSidebar({ mode: "create" })}
          >
            New project <Icons.Plus />
          </Button>
        </header>
        <div>{projects?.length ?? 0} projects</div>
      </div>
      <ProjectSidebar />
    </>
  );
}
