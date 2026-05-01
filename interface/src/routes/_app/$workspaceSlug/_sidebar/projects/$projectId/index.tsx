import { RichTextEditor } from "@recount/editor";
import { Input } from "@recount/ui/input";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { useWorkspaceDb } from "~/db/workspace/context";
import { m } from "~/paraglide/messages";

import {
  PageContainer,
  PageTopBar,
  PageTopBarBreadcrumbs,
} from "../../-components/page";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/_sidebar/projects/$projectId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { projectId } = Route.useParams();

  const workspaceDb = useWorkspaceDb();
  const { data: project, isLoading } = useLiveQuery((q) =>
    q
      .from({ p: workspaceDb.collections.projectsCollection })
      .where(({ p }) => eq(p.id, projectId))
      .findOne()
  );

  if (isLoading) {
    return null;
  }

  if (!project) {
    return notFound();
  }

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
                {
                  label: project.name,
                  linkOptions: {
                    to: "/$workspaceSlug/projects/$projectId",
                    from: "/$workspaceSlug/projects/$projectId/",
                  },
                },
              ]}
            />
          }
        />
        <PageContainer>
          <div
            className="size-7 rounded-md"
            style={{ backgroundColor: project.hexColor }}
          />
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <RichTextEditor content={project.notes} onChange={(value) => {}} />
          <section>
            <h3>Properties</h3>
            <div></div>
          </section>
        </PageContainer>
      </div>
    </div>
  );
}
