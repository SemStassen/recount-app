import { Project } from "@recount/core/modules/project";
import { Form } from "@recount/ui/form";
import { revalidateLogic } from "@tanstack/react-form";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";
import { m } from "~/paraglide/messages";

const schema = createSchemaForm(Project.jsonCreate);

export function CreateProjectForm() {
  const createProject = useWorkspaceMutation("Project.Create");

  const form = useAppForm({
    formId: `create-project`,
    defaultValues: {
      name: "",
      hexColor: "#000000",
      isBillable: false,
      notes: null,
    } satisfies typeof schema.validator.Encoded,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(({ value }) => {
      createProject({
        payload: value,
      });
    }),
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
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
          <field.TextField
            direction="vertical"
            label={{ children: m.project_form_color_label() }}
          />
        )}
        name="hexColor"
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
          />
        )}
        name="notes"
      />
      <form.AppForm>
        <form.SubmitButton className="w-full">
          {m.project_create_submit()}
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
