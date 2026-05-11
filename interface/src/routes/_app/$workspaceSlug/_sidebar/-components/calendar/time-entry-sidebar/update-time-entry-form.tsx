import { TimeEntry } from "@recount/core/modules/time";
import type { TimeEntryId } from "@recount/core/shared/schemas";
import { Form } from "@recount/ui/form";
import { eq, useLiveQuery, toArray } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { DateTime, Option } from "effect";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { createSchemaForm } from "~/lib/form";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";

import {
  TimeEntryFieldGroup,
  timeEntryFields,
  type TimeEntryFormValues,
} from "./time-entry-field-group";

const schema = createSchemaForm(TimeEntry.jsonUpdate);

export function UpdateTimeEntryForm({
  timeEntryId,
}: {
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

  const { data: projects = [] } = useLiveQuery((q) =>
    q
      .from({ p: workspaceDb.collections.activeProjectsCollection })
      .select(({ p }) => ({
        ...p,
        tasks: toArray(
          q
            .from({ t: workspaceDb.collections.tasksCollection })
            .where(({ t }) => eq(p.id, t.projectId))
        ),
      }))
  );

  if (isLoading || !timeEntry) return null;

  return (
    <UpdateTimeEntryFormContent
      key={timeEntry.id}
      projects={projects}
      timeEntry={timeEntry}
    />
  );
}

function UpdateTimeEntryFormContent({
  projects,
  timeEntry,
}: {
  projects: Array<{
    id: string;
    name: string;
    tasks: Array<{
      id: string;
      name: string;
    }>;
  }>;
  timeEntry: typeof TimeEntry.json.Type;
}) {
  const updateTimeEntry = useWorkspaceMutation("TimeEntry.Update");

  const defaultValues: TimeEntryFormValues = {
    startedAt: DateTime.toDate(timeEntry.startedAt),
    stoppedAt: Option.match(timeEntry.stoppedAt, {
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
    onSubmit: schema.handleSubmit(async ({ value }) => {
      await updateTimeEntry({
        payload: {
          timeEntryId: timeEntry.id,
          data: value,
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
