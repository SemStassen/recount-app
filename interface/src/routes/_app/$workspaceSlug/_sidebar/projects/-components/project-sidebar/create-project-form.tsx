import { Project } from "@recount/core/modules/project";

import { useAppForm } from "~/components/form";

const schema = Project.jsonCreate;

export function CreateProjectForm() {
  const form = useAppForm({
    defaultValues: {
      name: "",
      startDate: new Date(),
      endDate: new Date(),
      hexColor: "#000000",
      isBillable: false,
      notes: undefined,
    } satisfies (typeof schema)["Encoded"],
  });

  return (
    <form>
      <form.AppField
        children={(field) => (
          <field.TextField
            direction="vertical"
            label={{ children: "Name" }}
            input={{ autoFocus: true, autoComplete: "off" }}
          />
        )}
        name="name"
      />
      <form.AppField
        children={(field) => (
          <field.DateField
            direction="vertical"
            label={{ children: "Start Date" }}
          />
        )}
        name="startDate"
      />
      <form.AppField
        children={(field) => (
          <field.DateField
            direction="vertical"
            label={{ children: "End Date" }}
          />
        )}
        name="endDate"
      />
    </form>
  );
}
