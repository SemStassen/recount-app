import { Project } from "@recount/core/modules/project";
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
import { revalidateLogic } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { useRegisterCommands } from "~/features/command-menu";
import { createSchemaForm } from "~/lib/form";
import { m } from "~/paraglide/messages";

interface Payload {}

export const createProjectDialogHandle =
  DialogPrimitive.createHandle<Payload>();

export function CreateProjectDialog() {
  useRegisterCommands([
    {
      id: "create-project",
      category: "project",
      title: "Create new project",
      perform: async ({ close }) => {
        await close();
        createProjectDialogHandle.openWithPayload({});
      },
    },
  ]);

  return (
    <Dialog handle={createProjectDialogHandle}>
      {({ payload }) => <CreateProjectDialogContent payload={payload} />}
    </Dialog>
  );
}

const schema = createSchemaForm(Project.jsonCreate);

const defaultValues: typeof schema.validator.Encoded = {
  name: "",
  color: "#000000",
  isBillable: false,
  notes: null,
};

function CreateProjectDialogContent({
  payload,
}: {
  payload: Payload | undefined;
}) {
  const workspaceDb = useWorkspaceDb();
  const navigate = useNavigate();

  const form = useAppForm({
    formId: "create-project-form",
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(({ value: payload }) => {
      const project = workspaceDb.actions.createProject(payload);

      navigate({
        from: "/$workspaceSlug/",
        to: "/$workspaceSlug/projects/$projectId",
        params: {
          projectId: project.id,
        },
      });

      createProjectDialogHandle.close();
    }),
  });

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
        <DialogTitle>Create new project</DialogTitle>
      </DialogHeader>
      <DialogPanel>
        <Form
          render={
            <div>
              <form.AppField
                children={(field) => (
                  <field.TextField
                    direction="vertical"
                    label={{ children: m.project_form_name_label() }}
                    input={{ autoFocus: true, autoComplete: "off" }}
                  />
                )}
                name="name"
              />
              <form.AppField
                children={(field) => (
                  <field.ColorPickerField
                    direction="vertical"
                    label={{ children: m.project_form_color_label() }}
                  />
                )}
                name="color"
              />
              <form.AppField
                children={(field) => (
                  <field.SwitchField
                    direction="vertical"
                    label={{ children: m.project_form_billable_label() }}
                  />
                )}
                name="isBillable"
              />
              <form.AppField
                children={(field) => (
                  <field.EditorField
                    direction="vertical"
                    label={{ children: m.project_form_notes_label() }}
                    editor={{
                      placeholder: "Notes...",
                    }}
                  />
                )}
                name="notes"
              />
            </div>
          }
        />
      </DialogPanel>
      <DialogFooter>
        <form.AppForm>
          <form.SubmitButton>{m.project_create_submit()}</form.SubmitButton>
        </form.AppForm>
      </DialogFooter>
    </DialogPopup>
  );
}
