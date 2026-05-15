import { Task } from "@recount/core/modules/project";
import type { ProjectId } from "@recount/core/shared/schemas";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogPrimitive,
  DialogTitle,
} from "@recount/ui/dialog";
import { Form, FormPrimitive } from "@recount/ui/form";
import { useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { Exit } from "effect";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { useRegisterCommands } from "~/features/command-menu";
import { createSchemaForm } from "~/lib/form";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";

interface Payload {
  initialProjectId?: ProjectId;
}

export const createTaskDialogHandle = DialogPrimitive.createHandle<Payload>();

export function CreateTaskDialog() {
  useRegisterCommands([
    {
      id: "create-task",
      category: "project",
      title: "Create new task",
      perform: async ({ close }) => {
        await close();
        createTaskDialogHandle.open(null);
      },
    },
  ]);

  return (
    <Dialog handle={createTaskDialogHandle}>
      {({ payload }) => <CreateTaskDialogPopup payload={payload} />}
    </Dialog>
  );
}

const schema = createSchemaForm(Task.jsonCreate);

function CreateTaskDialogPopup({ payload }: { payload: Payload | undefined }) {
  const navigate = useNavigate();

  const workspaceDb = useWorkspaceDb();
  const { data: projects, isLoading } = useLiveQuery((q) =>
    q
      .from({ p: workspaceDb.collections.activeProjectsCollection })
      .select(({ p }) => ({
        id: p.id,
        name: p.name,
      }))
  );

  const createTask = useWorkspaceMutation("Task.Create");

  const form = useAppForm({
    formId: "create-task-form",
    defaultValues: {
      name: "",
      projectId: payload?.initialProjectId ?? "",
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(async ({ value }) => {
      const res = await createTask({
        payload: value,
      });

      Exit.match(res, {
        onFailure: () => {},
        onSuccess: () => {
          navigate({
            from: "/$workspaceSlug/",
            to: "/$workspaceSlug/projects/$projectId",
            params: {
              projectId: value.projectId,
            },
          });

          createTaskDialogHandle.close();
        },
      });
    }),
  });

  if (isLoading) {
    return null;
  }

  return (
    <DialogPopup
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
                  <field.SelectField
                    direction="vertical"
                    label={{
                      children: "Project",
                    }}
                    select={{
                      items: projects.map((p) => ({
                        label: p.name,
                        value: p.id,
                      })),
                    }}
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
    </DialogPopup>
  );
}
