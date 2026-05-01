import { useAtomSet } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { createFileRoute } from "@tanstack/react-router";

import { projectSidebarAtom } from "~/atoms/ui-atoms";
import { m } from "~/paraglide/messages";

import { PageTopBar, PageTopBarBreadcrumbs } from "../-components/page";
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
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col w-full">
        <PageTopBar
          left={
            <PageTopBarBreadcrumbs
              items={[
                {
                  label: m.project({ count: "plural" }),
                  linkOptions: {
                    to: "/$workspaceSlug/projects",
                    from: "/$workspaceSlug",
                  },
                },
              ]}
            />
          }
          right={
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setProjectSidebar({ mode: "create" })}
            >
              <Icons.Plus />
            </Button>
          }
        />
        <ProjectsList />
      </div>
      <ProjectSidebar />
    </div>
  );
}
