import { useAtomSet } from "@effect/atom-react";
import { Project } from "@recount/core/modules/project";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { ProjectId } from "@recount/core/shared/schemas";
import { Form } from "@recount/ui/form";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";
import { Option } from "effect";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { createSchemaForm, optionDateTimeToDate } from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { m } from "~/paraglide/messages";

import type { ProjectFormValues } from "./project-form-fields";
import { projectFormFieldMap, ProjectFormFields } from "./project-form-fields";

const schema = createSchemaForm(Project.jsonUpdate);

export function UpdateProjectForm({ projectId }: { projectId: ProjectId }) {
  const workspaceDb = useWorkspaceDb();
  const { data: project, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ p: workspaceDb.collections.projectsCollection })
        .where(({ p }) => eq(p.id, projectId))
        .findOne(),
    [projectId]
  );

  if (isLoading || !project) return null;

  return <UpdateProjectFormContent key={project.id} project={project} />;
}

function UpdateProjectFormContent({ project }: { project: Project }) {
  const { workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const updateProject = useAtomSet(
    RecountAtomRpcClient.mutation("Project.Update"),
    {
      mode: "promiseExit",
    }
  );

  const defaultValues: ProjectFormValues = {
    name: project.name,
    hexColor: project.hexColor,
    isBillable: project.isBillable,
    notes: Option.getOrNull(project.notes),
  };

  const form = useAppForm({
    formId: `update-project-${project.id}`,
    defaultValues: defaultValues,
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(({ value }) => {
      updateProject({
        payload: {
          id: project.id,
          data: value,
        },
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
          {m.project_update_submit()}
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
