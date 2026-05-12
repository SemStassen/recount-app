import { useAtomSet } from "@effect/atom-react";
import { TimeEntry } from "@recount/core/modules/time";
import type { TimeEntryId } from "@recount/core/shared/schemas";
import { Form } from "@recount/ui/form";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { DateTime, Option } from "effect";
import { useEffect } from "react";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { createSchemaForm } from "~/lib/form";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";

import { calendarEditingPreviewAtom, closeTimeEntryEditor } from "../atoms";
import {
  TimeEntryFieldGroup,
  timeEntryFields,
  type TimeEntryFormValues,
} from "./time-entry-field-group";
import {
  type TimeEntryFormProject,
  useTimeEntryFormProjects,
} from "./use-time-entry-form-projects";

const schema = createSchemaForm(TimeEntry.jsonUpdate);

export function UpdateTimeEntryForm({
  initialRange,
  timeEntryId,
}: {
  initialRange?: { startedAt: Date; stoppedAt: Date };
  timeEntryId: TimeEntryId;
}) {
  const workspaceDb = useWorkspaceDb();
  const { data: timeEntry, isLoading } = useLiveQuery(
    (q) =>
      q
        .from({ timeEntry: workspaceDb.collections.timeEntriesCollection })
        .where(({ timeEntry }) => eq(timeEntry.id, timeEntryId))
        .findOne(),
    [timeEntryId]
  );

  const { data: projects = [] } = useTimeEntryFormProjects();

  if (isLoading || !timeEntry) return null;

  return (
    <UpdateTimeEntryFormContent
      key={timeEntry.id}
      initialRange={initialRange}
      projects={projects}
      timeEntry={timeEntry}
    />
  );
}

function UpdateTimeEntryFormContent({
  initialRange,
  projects,
  timeEntry,
}: {
  initialRange?: { startedAt: Date; stoppedAt: Date };
  projects: Array<TimeEntryFormProject>;
  timeEntry: typeof TimeEntry.json.Type;
}) {
  const updateTimeEntry = useWorkspaceMutation("TimeEntry.Update");
  const setPreview = useAtomSet(calendarEditingPreviewAtom);
  const closeEditor = useAtomSet(closeTimeEntryEditor);
  const initialStartedAtMs = initialRange?.startedAt.getTime();
  const initialStoppedAtMs = initialRange?.stoppedAt.getTime();
  const publishPreview = (values: TimeEntryFormValues) => {
    setPreview({
      startedAt: values.startedAt,
      stoppedAt: values.stoppedAt,
      projectId: values.projectId,
      replacingTimeEntryId: timeEntry.id,
    });
  };

  const defaultValues: TimeEntryFormValues = {
    startedAt:
      initialStartedAtMs !== undefined
        ? new Date(initialStartedAtMs)
        : DateTime.toDate(timeEntry.startedAt),
    stoppedAt:
      (initialStoppedAtMs !== undefined
        ? new Date(initialStoppedAtMs)
        : undefined) ??
      Option.match(timeEntry.stoppedAt, {
        onNone: () => null,
        onSome: DateTime.toDate,
      }),
    projectId: timeEntry.projectId,
    taskId: Option.getOrNull(timeEntry.taskId),
    notes: Option.getOrNull(timeEntry.notes),
  };

  const form = useAppForm({
    formId: `update-time-entry-${timeEntry.id}`,
    defaultValues,
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
      await updateTimeEntry({
        payload: {
          timeEntryId: timeEntry.id,
          data: value,
        },
      });
      closeEditor();
    }),
  });

  useEffect(() => {
    if (initialStartedAtMs === undefined || initialStoppedAtMs === undefined) {
      return;
    }

    form.setFieldValue("startedAt", new Date(initialStartedAtMs));
    form.setFieldValue("stoppedAt", new Date(initialStoppedAtMs));
  }, [form, initialStartedAtMs, initialStoppedAtMs]);

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
        <form.SubmitButton>Update time entry</form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
