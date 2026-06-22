import { useAtomSet } from "@effect/atom-react";
import { TimeEntry } from "@recount/core/modules/time";
import type { TimeEntryId } from "@recount/core/shared/schemas";
import { Form } from "@recount/ui/form";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { useEffect } from "react";

import { useAppForm } from "~/components/form";
import type { TimeEntryViewRow } from "~/db/synced-collections";
import { useWorkspaceDb } from "~/db/workspace/context";
import { createSchemaForm } from "~/lib/form";

import { editingPreviewAtom, closeTimeEntryEditor } from "../state/atoms";
import { TimeEntryFieldGroup, timeEntryFields } from "./field-group";
import type { TimeEntryFormValues } from "./field-group";
import {
  getUpdateTimeEntryFormDefaults,
  getUpdateTimeEntryPreview,
} from "./model";
import { useTimeEntryFormProjects } from "./use-projects";
import type { TimeEntryFormProject } from "./use-projects";

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
        .from({ te: workspaceDb.collections.timeEntriesCollection })
        .where(({ te }) => eq(te.id, timeEntryId))
        .findOne(),
    [timeEntryId]
  );

  const { data: projects = [] } = useTimeEntryFormProjects();

  if (isLoading || !timeEntry || timeEntry.stoppedAt === null) {
    return null;
  }

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
  timeEntry: TimeEntryViewRow;
}) {
  const workspaceDb = useWorkspaceDb();
  const setPreview = useAtomSet(editingPreviewAtom);
  const closeEditor = useAtomSet(closeTimeEntryEditor);
  const initialStartedAtMs = initialRange?.startedAt.getTime();
  const initialStoppedAtMs = initialRange?.stoppedAt.getTime();
  const publishPreview = (values: TimeEntryFormValues) => {
    setPreview(
      getUpdateTimeEntryPreview({ timeEntryId: timeEntry.id, values })
    );
  };

  const defaultValues = getUpdateTimeEntryFormDefaults({
    initialRange,
    timeEntry,
  });

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
    onSubmit: schema.handleSubmit(({ value }) => {
      workspaceDb.actions.updateTimeEntry(timeEntry.id, value);
      closeEditor(undefined);
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
