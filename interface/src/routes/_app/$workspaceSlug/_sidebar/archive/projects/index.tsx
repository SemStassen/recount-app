import { createFileRoute } from "@tanstack/react-router";

import { m } from "~/paraglide/messages";

import {
  Page,
  PageMain,
  PageTopBar,
  PageTopBarBreadcrumbs,
} from "../../-components/page";
import { ArchivedProjectsList } from "./-components/archived-projects-list";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/_sidebar/archive/projects/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Page>
      <PageMain>
        <PageTopBar
          left={
            <PageTopBarBreadcrumbs
              items={(breadcrumbs) => {
                breadcrumbs.push({
                  label: "Projects archive",
                  linkOptions: {
                    to: "/$workspaceSlug/archive/projects",
                    from: "/$workspaceSlug",
                  },
                });
              }}
            />
          }
        />
        <ArchivedProjectsList />
      </PageMain>
    </Page>
  );
}
