import { useAtomValue } from "@effect/atom-react";
import { TimeEntry } from "@recount/core/modules/time";
import { Form } from "@recount/ui/form";
import { eq, useLiveQuery, toArray } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { createSchemaForm } from "~/lib/form";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";

import { sortedTimeEntrySidebarSelectionAtom } from "../atoms";
import {
  TimeEntryFieldGroup,
  timeEntryFields,
  type TimeEntryFormValues,
} from "./time-entry-field-group";

const schema = createSchemaForm(TimeEntry.jsonCreate);

const defaultValues: TimeEntryFormValues = {
  startedAt: new Date(),
  stoppedAt: new Date(),
  projectId: "",
  taskId: null,
  notes: null,
};

export function CreateTimeEntryForm() {
  const sidebarSelection = useAtomValue(sortedTimeEntrySidebarSelectionAtom);

  const workspaceDb = useWorkspaceDb();
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

  const createTimeEntry = useWorkspaceMutation("TimeEntry.Create");

  const form = useAppForm({
    formId: "create-time-entry-form",
    defaultValues: {
      ...defaultValues,
      startedAt: sidebarSelection?.start ?? defaultValues.startedAt,
      stoppedAt: sidebarSelection?.end ?? defaultValues.stoppedAt,
      projectId: projects[0]?.id ?? defaultValues.projectId,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(async ({ value }) => {
      await createTimeEntry({ payload: value });
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
