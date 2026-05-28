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
import { createProjectDialogHandle } from "../../-components/create-project-dialog";
import { ProjectsList } from "./-components/projects-list";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/projects/")(
  {
    component: RouteComponent,
  }
);

function RouteComponent() {
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
              onClick={() => createProjectDialogHandle.open(null)}
            >
              <Icons.Plus />
            </Button>
          }
        />
        <ProjectsList />
      </PageMain>
    </Page>
  );
}
