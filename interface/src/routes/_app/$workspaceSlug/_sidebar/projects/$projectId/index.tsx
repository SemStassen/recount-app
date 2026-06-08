import { HexColor, ProjectId } from "@recount/core/shared/schemas";
import { RichTextEditor } from "@recount/editor";
import { Separator } from "@recount/ui/separator";
import { eq, toArray, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, notFound, rootRouteId } from "@tanstack/react-router";

import { ColorPicker } from "~/components/color-picker";
import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { useRegisterCommands } from "~/features/command-menu";
import { m } from "~/paraglide/messages";

import {
  Page,
  PageContainer,
  PageMain,
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

  useRegisterCommands(
    [
      {
        id: "archive-project",
        category: "project",
        title: "Archive project",
        perform: ({ close }) => {
          workspaceDb.actions.archiveProject(ProjectId.make(projectId));
          navigate({ to: "/$workspaceSlug/projects" });
          close();
        },
      },
    ],
    {
      id: "archive-project",
    }
  );

  const testProjectForm = useAppForm({
    formId: "test-project-form",
    defaultValues: {
      name: project?.name ?? "",
    },
  });

  if (isLoading) {
    return null;
  }

  if (!project) {
    throw notFound({ routeId: rootRouteId });
  }

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
          <div className="flex flex-row gap-2 items-center">
            <ColorPicker
              value={project.color}
              onValueChange={(color) => {
                if (!color || color === project.color) return;

                workspaceDb.actions.updateProject(project.id, {
                  color: HexColor.make(color),
                });
              }}
            />
            <testProjectForm.AppField
              name="name"
              listeners={{
                onBlur: ({ fieldApi, value }) => {
                  workspaceDb.actions.updateProject(ProjectId.make(projectId), {
                    [fieldApi.name]: value,
                  });
                },
              }}
              children={(field) => (
                <field.TextField
                  direction="vertical"
                  label={{
                    children: "Name",
                    className: "sr-only",
                  }}
                />
              )}
            />
            {/*<h1 className="text-2xl font-semibold">{project.name}</h1>*/}
          </div>
          <RichTextEditor
            content={project.notes}
            onChange={(value) => {}}
            placeholder="Notes..."
          />
          <Separator orientation="horizontal" />
          <section>
            <h3>Tasks</h3>
            <TasksList projectId={project.id} tasks={project.tasks} />
          </section>
        </PageContainer>
      </PageMain>
    </Page>
  );
}
