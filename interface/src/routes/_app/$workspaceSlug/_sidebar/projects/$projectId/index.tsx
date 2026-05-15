import { HexColor, ProjectId } from "@recount/core/shared/schemas";
import { RichTextEditor } from "@recount/editor";
import { Separator } from "@recount/ui/separator";
import { eq, toArray, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { ColorPicker } from "~/components/color-picker";
import { useWorkspaceDb } from "~/db/workspace/context";
import { useRegisterCommands } from "~/features/command-menu";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";
import { m } from "~/paraglide/messages";

import {
  PageContainer,
  PageTopBar,
  PageTopBarBreadcrumbs,
} from "../../-components/page";
import { TasksList } from "./-components/tasks-list";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/_sidebar/projects/$projectId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { projectId } = Route.useParams();

  const workspaceDb = useWorkspaceDb();
  const { data: project, isLoading } = useLiveQuery((q) =>
    q
      .from({ p: workspaceDb.collections.activeProjectsCollection })
      .where(({ p }) => eq(p.id, projectId))
      .select(({ p }) => ({
        ...p,
        tasks: toArray(
          q
            .from({ t: workspaceDb.collections.activeTasksCollection })
            .where(({ t }) => eq(t.projectId, p.id))
        ),
      }))
      .findOne()
  );

  const archiveProject = useWorkspaceMutation("Project.Archive");
  const updateProject = useWorkspaceMutation("Project.Update");

  useRegisterCommands(
    [
      {
        id: "archive-project",
        category: "project",
        title: "Archive project",
        perform: ({ close }) => {
          archiveProject({
            payload: {
              id: ProjectId.make(projectId),
            },
          });
          navigate({ to: "/$workspaceSlug/projects" });
          close();
        },
      },
    ],
    {
      id: "archive-project",
    }
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
              items={(breadcrumbs) => {
                breadcrumbs.push({
                  label: m.project({ count: "plural" }),
                  linkOptions: {
                    to: "/$workspaceSlug/projects",
                    from: "/$workspaceSlug",
                  },
                });

                breadcrumbs.push({
                  label: project.name,
                  linkOptions: {
                    to: "/$workspaceSlug/projects/$projectId",
                    from: "/$workspaceSlug/projects/$projectId/",
                  },
                });
              }}
            />
          }
        />
        <PageContainer className="space-y-2">
          <ColorPicker
            value={project.color}
            onValueChange={(color) => {
              if (!color || color === project.color) return;

              updateProject({
                payload: {
                  id: ProjectId.make(projectId),
                  data: { color: HexColor.make(color) },
                },
              });
            }}
          />
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <RichTextEditor content={project.notes} onChange={(value) => {}} />
          <Separator orientation="horizontal" />
          <section>
            <h3>Tasks</h3>
            <TasksList projectId={project.id} tasks={project.tasks} />
          </section>
        </PageContainer>
      </div>
    </div>
  );
}
