import { useAtomSet } from "@effect/atom-react";
import { Project } from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { Form } from "@recount/ui/form";
import { revalidateLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { m } from "~/paraglide/messages";

import {
  formOpts,
  ProjectFormFields,
  projectFormFieldMap,
} from "./project-form-fields";

const schema = createSchemaForm(Project.jsonCreate);

export function CreateProjectForm() {
  const { workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const createProject = useAtomSet(
    RecountAtomRpcClient.mutation("Project.Create"),
    {
      mode: "promiseExit",
    }
  );

  const form = useAppForm({
    formId: `create-project`,
    ...formOpts,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(({ value }) => {
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
      <ProjectFormFields form={form} fields={projectFormFieldMap} />
      <form.AppForm>
        <form.SubmitButton className="w-full">
          {m.project_create_submit()}
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
