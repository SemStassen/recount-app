import { useAtomSet } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { createFileRoute } from "@tanstack/react-router";

import { m } from "~/paraglide/messages";

import {
  Page,
  PageMain,
  PageTopBar,
  PageTopBarBreadcrumbs,
} from "../-components/page";
import { CreateProjectSidebar } from "./-components/create-project-sidebar";
import { isCreateProjectSidebarOpenAtom } from "./-components/create-project-sidebar/atoms";
import { ProjectsList } from "./-components/projects-list";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/projects/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
  const setIsCreateProjectSidebarOpen = useAtomSet(
    isCreateProjectSidebarOpenAtom
  );

  return (
    <Page>
      <PageMain>
        <PageTopBar
          left={
            <PageTopBarBreadcrumbs
              items={(breadcrumbs) => {
                breadcrumbs.push({
                  label: m.project({ count: "plural" }),
                  linkOptions: {
                    to: "/$workspaceSlug/projects",
                    from: "/$workspaceSlug",
                  },
                });
              }}
            />
          }
          right={
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsCreateProjectSidebarOpen(true)}
            >
              <Icons.Plus />
            </Button>
          }
        />
        <ProjectsList />
      </PageMain>
      <CreateProjectSidebar />
    </Page>
  );
}
