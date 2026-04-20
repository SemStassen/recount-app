import { useAtomSet } from "@effect/atom-react";
import { Project } from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { ProjectId } from "@recount/core/shared/schemas";
import { Form } from "@recount/ui/form";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";
import { Schema } from "effect";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import {
  createDynamicValidator,
  createSubmitValidator,
  createParsedSubmitHandler,
} from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { m } from "~/paraglide/messages";

const schema = Project.jsonCreate;
const standardSchema = Schema.toStandardSchemaV1(schema);

export function CreateProjectForm({ projectId }: { projectId?: ProjectId }) {
  const { workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const createProject = useAtomSet(
    RecountAtomRpcClient.mutation("Project.Create"),
    {
      mode: "promiseExit",
    }
  );

  const workspaceDb = useWorkspaceDb();
  const { data: project } = useLiveQuery(
    (q) =>
      q
        .from({ p: workspaceDb.collections.projectsCollection })
        .where(({ p }) => eq(p.id, projectId))
        .findOne(),
    [projectId]
  );

  const defaultValues: typeof standardSchema.Encoded = {
    name: project?.name ?? "",
    startDate: null,
    targetDate: null,
    hexColor: project?.hexColor ?? "#000000",
    isBillable: false,
    notes: null,
  };

  const form = useAppForm({
    formId: `create-project`,
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
