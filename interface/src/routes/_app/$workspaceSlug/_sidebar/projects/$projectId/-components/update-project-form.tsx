import { Project } from "@recount/core/modules/project";
import type { ProjectId } from "@recount/core/shared/schemas";
import { Form } from "@recount/ui/form";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { Option } from "effect";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { createSchemaForm } from "~/lib/form";
import { m } from "~/paraglide/messages";

const schema = createSchemaForm(Project.jsonUpdate);

export function UpdateProjectForm({ projectId }: { projectId: ProjectId }) {
  const workspaceDb = useWorkspaceDb();
  const { data: project, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ p: workspaceDb.collections.activeProjectsCollection })
        .where(({ p }) => eq(p.id, projectId))
        .findOne(),
    [projectId]
  );

  if (isLoading || !project) return null;

  return <UpdateProjectFormContent key={project.id} project={project} />;
}

function UpdateProjectFormContent({ project }: { project: Project }) {
  const workspaceDb = useWorkspaceDb();

  const defaultValues: ProjectFormValues = {
    name: project.name,
    color: project.color,
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
      workspaceDb.actions.updateProject(project.id, value);
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
