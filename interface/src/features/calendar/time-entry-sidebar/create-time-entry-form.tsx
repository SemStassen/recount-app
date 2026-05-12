import { useAtomSet } from "@effect/atom-react";
import { TimeEntry } from "@recount/core/modules/time";
import { Form } from "@recount/ui/form";
import { revalidateLogic } from "@tanstack/react-form";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";

import { calendarEditingPreviewAtom, closeTimeEntryEditor } from "../atoms";
import {
  TimeEntryFieldGroup,
  timeEntryFields,
  type TimeEntryFormValues,
} from "./time-entry-field-group";
import { useTimeEntryFormProjects } from "./use-time-entry-form-projects";

const schema = createSchemaForm(TimeEntry.jsonCreate);

const defaultValues: TimeEntryFormValues = {
  startedAt: new Date(),
  stoppedAt: new Date(),
  projectId: "",
  taskId: null,
  notes: null,
};

export function CreateTimeEntryForm({
  initialRange,
}: {
  initialRange: { startedAt: Date; stoppedAt: Date } | null;
}) {
  const setPreview = useAtomSet(calendarEditingPreviewAtom);
  const closeEditor = useAtomSet(closeTimeEntryEditor);
  const { data: projects = [] } = useTimeEntryFormProjects();

  const createTimeEntry = useWorkspaceMutation("TimeEntry.Create");
  const publishPreview = (values: TimeEntryFormValues) => {
    setPreview({
      startedAt: values.startedAt,
      stoppedAt: values.stoppedAt,
      projectId: values.projectId || null,
      replacingTimeEntryId: null,
    });
  };

  const form = useAppForm({
    formId: "create-time-entry-form",
    defaultValues: {
      ...defaultValues,
      startedAt: initialRange?.startedAt ?? defaultValues.startedAt,
      stoppedAt: initialRange?.stoppedAt ?? defaultValues.stoppedAt,
    },
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
      closeEditor();
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
