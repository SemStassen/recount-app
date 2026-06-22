import { createFileRoute } from "@tanstack/react-router";

import { ArchivedProjectsList } from "~/modules/project";

import {
  Page,
  PageMain,
  PageTopBar,
  PageTopBarBreadcrumbs,
} from "../../-components/page";

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
