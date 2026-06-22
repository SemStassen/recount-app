import { Icons } from "@recount/ui/icons";
import { Separator } from "@recount/ui/separator";

import { withFieldGroup } from "~/components/form";

export interface TimeEntryFormValues {
  startedAt: Date;
  stoppedAt: Date | null;
  projectId: string;
  taskId: string | null;
  notes: unknown;
}

export const timeEntryFields = {
  startedAt: "startedAt",
  stoppedAt: "stoppedAt",
  projectId: "projectId",
  taskId: "taskId",
  notes: "notes",
} as const;

const fieldGroupDefaultValues: TimeEntryFormValues = {
  startedAt: new Date(),
  stoppedAt: null,
  projectId: "",
  taskId: null,
  notes: null,
};

export const TimeEntryFieldGroup = withFieldGroup({
  defaultValues: fieldGroupDefaultValues,
  props: {
    projects: [] as Array<{
      id: string;
      name: string;
      color?: string | null;
      tasks: Array<{
        id: string;
        name: string;
      }>;
    }>,
  },
  render: function render({ group, projects }) {
    return (
      <>
        <div className="flex flex-row items-center justify-between gap-2">
          <group.AppField
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
          <group.AppField
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
        <group.AppField
          name="projectId"
          children={(field) => (
            <field.ProjectSelectField
              direction="vertical"
              label={{
                children: "Project",
              }}
              projects={projects}
            />
          )}
        />
        <group.Subscribe
          selector={(state) => state.values.projectId}
          children={(projectId) => (
            <group.AppField
              name="taskId"
              children={(field) => {
                const tasks =
                  projects.find((project) => project.id === projectId)?.tasks ??
                  [];

                const hasTasks = tasks.length > 0;

                return (
                  <field.SelectField
                    direction="vertical"
                    label={{
                      children: "Task",
                    }}
                    select={{
                      disabled: !hasTasks,
                      items: tasks.map((task) => ({
                        value: task.id,
                        label: task.name,
                      })),
                    }}
                    selectValue={{
                      placeholder: hasTasks
                        ? "Choose a task"
                        : "No tasks available",
                    }}
                  />
                );
              }}
            />
          )}
        />
        <Separator orientation="horizontal" />
        <group.AppField
          name="notes"
          children={(field) => (
            <field.EditorField
              direction="vertical"
              label={{
                className: "sr-only",
                children: "Notes",
              }}
              editor={{
                placeholder: "Notes",
                variant: "ghost",
              }}
            />
          )}
        />
      </>
    );
  },
});
