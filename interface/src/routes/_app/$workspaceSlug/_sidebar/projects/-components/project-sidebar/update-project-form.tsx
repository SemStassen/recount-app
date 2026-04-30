import { useAtomSet } from "@effect/atom-react";
import { Project } from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { ProjectId } from "@recount/core/shared/schemas";
import { Form } from "@recount/ui/form";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import {
  createSchemaForm,
  optionDateTimeToDate,
  optionToNullable,
} from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { m } from "~/paraglide/messages";

import type { ProjectFormValues } from "./project-form-fields";
import { projectFormFieldMap, ProjectFormFields } from "./project-form-fields";

const schema = createSchemaForm(Project.jsonUpdate);

export function UpdateProjectForm({ projectId }: { projectId: ProjectId }) {
  const { workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const workspaceDb = useWorkspaceDb();
  const { data: project, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ p: workspaceDb.collections.projectsCollection })
        .where(({ p }) => eq(p.id, projectId))
        .findOne(),
    [projectId]
  );

  const updateProject = useAtomSet(
    RecountAtomRpcClient.mutation("Project.Update"),
    {
      mode: "promiseExit",
    }
  );

  const defaultValues: ProjectFormValues = {
    name: project?.name || "",
    startDate: optionDateTimeToDate(project?.startDate),
    targetDate: optionDateTimeToDate(project?.targetDate),
    hexColor: project?.hexColor || "",
    isBillable: project?.isBillable || false,
    notes: optionToNullable(project?.notes) as ProjectFormValues["notes"],
  };

  const form = useAppForm({
    formId: `update-project-${projectId}`,
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(({ value }) => {
      updateProject({
        payload: {
          id: projectId,
          data: value,
        },
        headers: {
          [WORKSPACE_ID_HEADER]: workspace.id,
        },
      });
    }),
  });

  if (isLoading || !project) return null;

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
          {m.project_update_submit()}
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
