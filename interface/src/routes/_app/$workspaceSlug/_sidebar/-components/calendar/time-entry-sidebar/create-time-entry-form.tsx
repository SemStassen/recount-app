import { useAtomValue } from "@effect/atom-react";
import { TimeEntry } from "@recount/core/modules/time";
import { Form } from "@recount/ui/form";
import { Icons } from "@recount/ui/icons";
import { eq, useLiveQuery, toArray } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { createSchemaForm } from "~/lib/form";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";

import { sortedTimeEntrySidebarSelectionAtom } from "../atoms";

const schema = createSchemaForm(TimeEntry.jsonCreate);

type CreateTimeEntryFormValues = {
  startedAt: Date;
  stoppedAt: Date | null;
  projectId: string;
  taskId: string | null;
  notes: string | null;
};

const defaultValues: CreateTimeEntryFormValues = {
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
      .from({ p: workspaceDb.collections.projectsCollection })
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
      console.log(value);
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
      <div className="flex flex-row items-center gap-2 justify-between">
        <form.AppField
          name="startedAt"
          children={(field) => (
            <field.TimePickerField
              direction="vertical"
              label={{
                className: "sr-only",
                children: "Started at",
              }}
            />
          )}
        />
        <Icons.ArrowRight />
        <form.AppField
          name="stoppedAt"
          children={(field) => (
            <field.TimePickerField
              direction="vertical"
              label={{
                className: "sr-only",
                children: "Stopped at",
              }}
            />
          )}
        />
      </div>
      <form.AppField
        name="projectId"
        children={(field) => (
          <field.SelectField
            direction="vertical"
            label={{
              children: "Project",
            }}
            select={{
              items: projects.map((project) => ({
                value: project.id,
                label: project.name,
              })),
            }}
          />
        )}
      />
      <form.Subscribe
        selector={(state) => state.values.projectId}
        children={(projectId) => (
          <form.AppField
            name="taskId"
            children={(field) => {
              const tasks =
                projects.find((p) => p.id === projectId)?.tasks ?? [];

              const hasTasks = tasks.length > 0;

              return (
                <field.SelectField
                  direction="vertical"
                  label={{
                    children: "Task",
                  }}
                  select={{
                    disabled: !hasTasks,
                    items: tasks.map((t) => ({
                      value: t.id,
                      label: t.name,
                    })),
                  }}
                  selectValue={{
                    placeholder: hasTasks
                      ? "Choose a project"
                      : "No projects available",
                  }}
                />
              );
            }}
          />
        )}
      />
      <form.AppField
        name="notes"
        children={(field) => (
          <field.EditorField
            direction="vertical"
            label={{
              children: "Notes",
            }}
          />
        )}
      />
      <form.AppForm>
        <form.SubmitButton>Create time entry</form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
