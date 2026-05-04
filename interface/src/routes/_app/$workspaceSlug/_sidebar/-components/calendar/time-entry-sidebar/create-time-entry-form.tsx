import { useAtomValue } from "@effect/atom-react";
import type { Project, Task } from "@recount/core/modules/project";
import { Field } from "@recount/ui/field";
import { Fieldset } from "@recount/ui/fieldset";
import { Icons } from "@recount/ui/icons";
import { useLiveQuery } from "@tanstack/react-db";
import { revalidateLogic } from "@tanstack/react-form";
import { isEqual } from "date-fns";
import { Schema } from "effect";

import { atomRegistry } from "~/atoms/registry";
import { useAppForm } from "~/components/form";
import { useWorkspaceDb } from "~/db/workspace/context";

import {
  sortedTimeEntrySidebarSelectionAtom,
  timeEntrySidebarSelectionAtom,
} from "../atoms";

const createTimeEntrySchema = Schema.toStandardSchemaV1(
  Schema.Struct({
    startedAt: Schema.String,
    stoppedAt: Schema.String,
    projectId: Schema.NonEmptyString,
    taskId: Schema.optional(Schema.String),
    description: Schema.NullOr(Schema.String),
  })
);

type CreateTimeEntryFormValues = {
  startedAt: string;
  stoppedAt: string;
  projectId: string;
  taskId?: string;
  description: string | null;
};

const defaultValues: CreateTimeEntryFormValues = {
  startedAt: new Date().toISOString(),
  stoppedAt: new Date().toISOString(),
  projectId: "",
  taskId: undefined,
  description: null,
};

type ProjectWithTasks = Project & { tasks: Array<Task> };

function getProjectsWithTasks(
  projects: ReadonlyArray<Project>,
  tasks: ReadonlyArray<Task>
): Array<ProjectWithTasks> {
  return projects.map((project) => ({
    ...project,
    tasks: tasks.filter((task) => task.projectId === project.id),
  }));
}

function CreateTimeEntryForm() {
  const sidebarSelection = useAtomValue(sortedTimeEntrySidebarSelectionAtom);
  const workspaceDb = useWorkspaceDb();
  const { data: projects = [] } = useLiveQuery((q) =>
    q.from({ p: workspaceDb.collections.projectsCollection })
  );
  const { data: tasks = [] } = useLiveQuery((q) =>
    q.from({ t: workspaceDb.collections.tasksCollection })
  );
  const projectsWithTasks = getProjectsWithTasks(projects, tasks);

  const form = useAppForm({
    defaultValues: {
      ...defaultValues,
      startedAt:
        sidebarSelection?.start.toISOString() ?? defaultValues.startedAt,
      stoppedAt: sidebarSelection?.end.toISOString() ?? defaultValues.stoppedAt,
      projectId: projectsWithTasks[0]?.id.toString() ?? defaultValues.projectId,
    },
    validationLogic: revalidateLogic(),
    validators: {
      onDynamic: createTimeEntrySchema,
    },
  });

  return (
    <form>
      <div className="flex flex-col gap-6">
        <Fieldset>
          <div className="flex flex-row gap-2">
            <Icons.Clock className="size-4 shrink-0 text-muted-foreground" />
            <form.AppField
              children={(field) => (
                <field.TextField
                  description={{
                    className: "sr-only",
                    children: "Time you started working on the task",
                  }}
                  direction="vertical"
                  input={{ type: "datetime-local" }}
                  label={{ className: "sr-only", children: "Started At" }}
                />
              )}
              listeners={{
                onChange: (value) => {
                  if (isEqual(value.value, form.state.values.startedAt)) {
                    return;
                  }

                  const firstSelected = new Date(value.value);
                  atomRegistry.set(timeEntrySidebarSelectionAtom, {
                    firstSelected,
                    secondSelected: firstSelected,
                  });
                },
              }}
              name="startedAt"
            />
            <Icons.ArrowRight className="muted-foreground size-4 shrink-0" />
            <form.AppField
              children={(field) => (
                <field.TextField
                  description={{
                    className: "sr-only",
                    children: "Time you stopped working on the task",
                  }}
                  direction="vertical"
                  input={{ type: "datetime-local" }}
                  label={{ className: "sr-only", children: "Stopped At" }}
                />
              )}
              listeners={{
                onChange: (value) => {
                  if (isEqual(value.value, form.state.values.stoppedAt)) {
                    return;
                  }

                  atomRegistry.update(
                    timeEntrySidebarSelectionAtom,
                    (selection) => {
                      if (!selection) {
                        return selection;
                      }

                      return {
                        ...selection,
                        secondSelected: new Date(value.value),
                      };
                    }
                  );
                },
              }}
              name="stoppedAt"
            />
          </div>
        </Fieldset>
        <Fieldset>
          <div className="flex flex-row items-start gap-2">
            <Icons.Folder className="mt-2.5 size-4 shrink-0 text-muted-foreground" />

            <div className="flex flex-col gap-6">
              <form.AppField
                children={(field) => (
                  <field.SelectField
                    description={{
                      className: "sr-only",
                      children: "The project you worked on",
                    }}
                    direction="vertical"
                    items={[
                      {
                        label: "No project",
                        value: "",
                      },
                      ...projectsWithTasks.map((project) => ({
                        label: project.name,
                        value: project.id.toString(),
                      })),
                    ]}
                    label={{ className: "sr-only", children: "Project" }}
                  />
                )}
                name="projectId"
              />
              <form.Subscribe
                selector={(state) => state.values.projectId}
                children={(projectId) => (
                  <form.AppField
                    children={(field) => {
                      const tasks =
                        projectsWithTasks.find((p) => p.id === projectId)
                          ?.tasks ?? [];
                      const hasTasks = tasks.length > 0;

                      const items = hasTasks
                        ? [
                            { label: "No task", value: "" },
                            ...tasks.map((t) => ({
                              label: t.name,
                              value: t.id.toString(),
                            })),
                          ]
                        : [{ label: "No tasks available", value: "" }];

                      return (
                        <field.SelectField
                          description={{
                            className: "sr-only",
                            children: "The task of the project you worked on",
                          }}
                          direction="vertical"
                          field={{
                            disabled: !projectId || !hasTasks,
                          }}
                          items={items}
                          label={{ className: "sr-only", children: "Task" }}
                        />
                      );
                    }}
                    name="taskId"
                  />
                )}
              />
            </div>
          </div>
        </Fieldset>
        <Fieldset>
          <form.AppField
            children={(field) => (
              <field.TextareaField
                field={{
                  className: "ml-6",
                }}
                textarea={{
                  placeholder: "Notes...",
                }}
                direction="vertical"
                description={{
                  className: "sr-only",
                  children: "The description of the time entry",
                }}
                label={{ className: "sr-only", children: "Description" }}
              />
            )}
            name="description"
          />
        </Fieldset>
        <Field className="ml-6">
          <form.AppForm>
            <form.SubmitButton>Create Time Entry</form.SubmitButton>
          </form.AppForm>
        </Field>
      </div>
    </form>
  );
}

export { CreateTimeEntryForm };
