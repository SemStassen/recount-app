import { useAtomValue } from "@effect/atom-react";
import { TimeEntry } from "@recount/core/modules/time";
import { Form } from "@recount/ui/form";
import { Icons } from "@recount/ui/icons";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";

import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";
import { createSchemaForm } from "~/lib/form";

import { sortedTimeEntrySidebarSelectionAtom } from "../atoms";

const schema = createSchemaForm(TimeEntry.jsonCreate);

type CreateTimeEntryFormValues = {
  startedAt: string;
  stoppedAt: string;
  projectId: string;
  taskId?: string;
  description: string | null;
};

const defaultValues: CreateTimeEntryFormValues = {
  startedAt: new Date(),
  stoppedAt: new Date(),
  projectId: "",
  taskId: undefined,
  description: null,
};

export function CreateTimeEntryForm() {
  const sidebarSelection = useAtomValue(sortedTimeEntrySidebarSelectionAtom);
  const workspaceDb = useWorkspaceDb();
  const { data: projects = [] } = useLiveQuery((q) =>
    q
      .from({ p: workspaceDb.collections.projectsCollection })
      .leftJoin({ t: workspaceDb.collections.tasksCollection }, ({ p, t }) =>
        eq(p.id, t.projectId)
      )
      .select(({ p, t }) => ({
        ...p,
        tasks: t,
      }))
  );

  const form = useAppForm({
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
    onSubmit: schema.handleSubmit(async ({ value }) => {}),
  });

  return (
    <Form>
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
      {/*<form.AppField
        name="taskId"
        children={(field) => (
          <field.SelectField
            direction="vertical"
            label={{
              children: "Task",
            }}
            select={{
              items: projects.map((project) => ({
                value: project.id,
                label: project.name,
              })),
            }}
          />
        )}
      />*/}
      <form.AppField
        name="description"
        children={(field) => (
          <field.EditorField
            direction="vertical"
            label={{
              children: "Description",
            }}
          />
        )}
      />
    </Form>
  );
}
