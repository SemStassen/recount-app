import { TaskId } from "@recount/core/shared/schemas";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, notFound } from "@tanstack/react-router";

import { useWorkspaceDb } from "~/db/workspace/context";
import { useRegisterCommands } from "~/features/command-menu";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";
import { m } from "~/paraglide/messages";

import {
  PageContainer,
  PageTopBar,
  PageTopBarBreadcrumbs,
} from "../../-components/page";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/_sidebar/tasks/$taskId/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = Route.useNavigate();
  const { taskId } = Route.useParams();

  const workspaceDb = useWorkspaceDb();
  const { data: task, isLoading } = useLiveQuery((q) =>
    q
      .from({ t: workspaceDb.collections.activeTasksCollection })
      .where(({ t }) => eq(t.id, taskId))
      .leftJoin(
        { p: workspaceDb.collections.activeProjectsCollection },
        ({ p, t }) => eq(p.id, t.projectId)
      )
      .fn.select(({ t, p }) => ({
        ...t,
        project: p,
      }))
      .findOne()
  );

  const archiveTask = useWorkspaceMutation("Task.Archive");

  useRegisterCommands(
    [
      {
        id: "archive-task",
        category: "project",
        title: "Archive task",
        perform: ({ close }) => {
          archiveTask({
            payload: {
              id: TaskId.make(taskId),
            },
          });
          navigate({ to: "/$workspaceSlug/projects" });
          close();
        },
      },
    ],
    {
      id: "archive-task",
    }
  );

  if (isLoading) {
    return null;
  }

  if (!task?.name) {
    return notFound();
  }

  return (
    <div className="flex flex-row w-full h-full">
      <div className="flex flex-col w-full">
        <PageTopBar
          left={
            <PageTopBarBreadcrumbs
              items={(breadcrumbs) => {
                if (task.project) {
                  breadcrumbs.push({
                    label: m.project({ count: "plural" }),
                    linkOptions: {
                      from: "/$workspaceSlug/tasks/$taskId/",
                      to: "/$workspaceSlug/projects",
                    },
                  });
                  breadcrumbs.push({
                    label: task.project.name,
                    linkOptions: {
                      from: "/$workspaceSlug/tasks/$taskId/",
                      to: "/$workspaceSlug/projects/$projectId",
                      params: {
                        projectId: task.project.id,
                      },
                    },
                  });
                }

                breadcrumbs.push({
                  label: task.name,
                  linkOptions: {
                    from: "/$workspaceSlug/tasks/$taskId/",
                    to: "/$workspaceSlug/tasks/$taskId",
                    params: true,
                  },
                });
              }}
            />
          }
        />
        <PageContainer className="space-y-2">
          <h1 className="text-2xl font-semibold">{task.name}</h1>
        </PageContainer>
      </div>
    </div>
  );
}
