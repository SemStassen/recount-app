import { useAtomSet } from "@effect/atom-react";
import { Project } from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { Form } from "@recount/ui/form";
import { revalidateLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";

import { useAppForm } from "~/components/form";
import {
  createDynamicValidator,
  createSubmitValidator,
  createParsedSubmitHandler,
} from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { m } from "~/paraglide/messages";

const schema = Project.jsonCreate;

const defaultValues: typeof schema.Encoded = {
  name: "",
  startDate: null,
  targetDate: null,
  hexColor: "#000000",
  isBillable: false,
  notes: null,
};

export function CreateProjectForm() {
  const { workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const createProject = useAtomSet(
    RecountAtomRpcClient.mutation("Project.Create"),
    {
      mode: "promiseExit",
    }
  );

  const form = useAppForm({
    formId: "create-project",
    defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createDynamicValidator(schema),
      onSubmitAsync: createSubmitValidator(schema),
    },
    onSubmit: createParsedSubmitHandler(schema, ({ value }) => {
      createProject({
        payload: value,
        headers: {
          [WORKSPACE_ID_HEADER]: workspace.id,
        },
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
      <div className="flex flex-row justify-between gap-4">
        <form.AppField
          children={(field) => (
            <field.DateField
              direction="vertical"
              label={{ children: m.project_form_startDate_label() }}
            />
          )}
          name="startDate"
        />
        <form.AppField
          children={(field) => (
            <field.DateField
              direction="vertical"
              label={{ children: m.project_form_targetDate_label() }}
            />
          )}
          name="targetDate"
        />
      </div>
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
