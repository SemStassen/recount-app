import { useAtomSet } from "@effect/atom-react";
import { TimeEntry } from "@recount/core/modules/time";
import { Form } from "@recount/ui/form";
import { revalidateLogic } from "@tanstack/react-form";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";

import { editingPreviewAtom, closeTimeEntryEditor } from "../state/atoms";
import {
  TimeEntryFieldGroup,
  timeEntryFields,
  type TimeEntryFormValues,
} from "./field-group";
import {
  getCreateTimeEntryFormDefaults,
  getCreateTimeEntryPreview,
} from "./model";
import { useTimeEntryFormProjects } from "./use-projects";

const schema = createSchemaForm(TimeEntry.jsonCreate);

export function CreateTimeEntryForm({
  initialRange,
}: {
  initialRange: { startedAt: Date; stoppedAt: Date } | null;
}) {
  const setPreview = useAtomSet(editingPreviewAtom);
  const closeEditor = useAtomSet(closeTimeEntryEditor);
  const { data: projects = [] } = useTimeEntryFormProjects();

  const createTimeEntry = useWorkspaceMutation("TimeEntry.Create");
  const publishPreview = (values: TimeEntryFormValues) => {
    setPreview(getCreateTimeEntryPreview(values));
  };

  const form = useAppForm({
    formId: "create-time-entry-form",
    defaultValues: getCreateTimeEntryFormDefaults(initialRange),
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    listeners: {
      onMount: ({ formApi }) => publishPreview(formApi.state.values),
      onChange: ({ formApi }) => publishPreview(formApi.state.values),
    },
    onSubmit: schema.handleSubmit(async ({ value }) => {
      await createTimeEntry({ payload: value });
      closeEditor(undefined);
    }),
  });

  return (
    <Form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <TimeEntryFieldGroup
        fields={timeEntryFields}
        form={form}
        projects={projects}
      />
      <form.AppForm>
        <form.SubmitButton>Create time entry</form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
