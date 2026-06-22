import { Task } from "@recount/core/modules/project";
import { ProjectId, TaskId } from "@recount/core/shared/schemas";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPrimitive,
  DialogTitle,
} from "@recount/ui/dialog";
import { Form, FormPrimitive } from "@recount/ui/form";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate, useRouterState } from "@tanstack/react-router";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { useRegisterCommands } from "~/features/command-menu";
import { createSchemaForm } from "~/lib/form";

interface Payload {
  defaultProjectId?: ProjectId;
}

export const createTaskDialogHandle = DialogPrimitive.createHandle<Payload>();

export function CreateTaskDialog() {
  const defaultProjectId = useAssociatedRouteProjectId();

  useRegisterCommands([
    {
      id: "create-task",
      category: "project",
      title: "Create new task",
      perform: async ({ close }) => {
        await close();
        createTaskDialogHandle.openWithPayload({
          defaultProjectId,
        });
      },
    },
  ]);

  return (
    <Dialog handle={createTaskDialogHandle}>
      {({ payload }) => <CreateTaskDialogContent payload={payload} />}
    </Dialog>
  );
}

const schema = createSchemaForm(Task.jsonCreate);

function CreateTaskDialogContent({
  payload,
}: {
  payload: Payload | undefined;
}) {
  const navigate = useNavigate();

  const workspaceDb = useWorkspaceDb();
  const { data: projects, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ p: workspaceDb.collections.activeProjectsCollection })
        .select(({ p }) => ({
          id: p.id,
          name: p.name,
          color: p.color,
        })),
    []
  );

  const form = useAppForm({
    formId: "create-task-form",
    defaultValues: {
      name: "",
      projectId: payload?.defaultProjectId ?? "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(({ value }) => {
      const task = workspaceDb.actions.createTask(value);

      navigate({
        from: "/$workspaceSlug/",
        to: "/$workspaceSlug/tasks/$taskId",
        params: {
          taskId: task.id,
        },
      });

      createTaskDialogHandle.close();
    }),
  });

  if (isLoading) {
    return null;
  }

  return (
    <DialogContent
      render={
        <FormPrimitive
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        />
      }
    >
      <DialogHeader>
        <DialogTitle>Create new task</DialogTitle>
      </DialogHeader>
      <DialogPanel>
        <Form
          render={
            <div>
              <form.AppField
                children={(field) => (
                  <field.TextField
                    direction="vertical"
                    label={{
                      children: "Name",
                    }}
                  />
                )}
                name="name"
              />
              <form.AppField
                children={(field) => (
                  <field.ProjectSelectField
                    direction="vertical"
                    label={{
                      children: "Project",
                    }}
                    projects={projects}
                  />
                )}
                name="projectId"
              />
            </div>
          }
        />
      </DialogPanel>
      <DialogFooter>
        <form.AppForm>
          <form.SubmitButton>Create task</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </DialogContent>
  );
}

function useAssociatedRouteProjectId() {
  const { projectId, taskId } = useRouterState({
    // Branded ids are not structurally shareable in TanStack Router selectors.
    structuralSharing: false,
    select: (state) => {
      const context: { projectId?: ProjectId; taskId?: TaskId } = {};

      for (const match of state.matches) {
        if ("projectId" in match.params) {
          context.projectId = ProjectId.make(match.params.projectId);
        }

        if ("taskId" in match.params) {
          context.taskId = TaskId.make(match.params.taskId);
        }
      }

      return context;
    },
  });

  const workspaceDb = useWorkspaceDb();
  const { data: routeTask } = useLiveQuery(
    (q) => {
      if (!taskId || projectId) {
        return undefined;
      }

      return q
        .from({ t: workspaceDb.collections.activeTasksCollection })
        .where(({ t }) => eq(t.id, taskId))
        .select(({ t }) => ({
          projectId: t.projectId,
        }))
        .findOne();
    },
    [projectId, taskId]
  );

  return projectId ?? routeTask?.projectId;
}
