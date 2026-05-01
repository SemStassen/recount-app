import type { RichTextContent } from "@recount/editor";
import { formOptions } from "@tanstack/react-form";

import { withFieldGroup } from "~/components/form";
import { m } from "~/paraglide/messages";

export type ProjectFormValues = {
  name: string;
  hexColor: string;
  isBillable: boolean;
  notes: RichTextContent | null;
};

export const defaultValues: ProjectFormValues = {
  name: "",
  hexColor: "#000000",
  isBillable: false,
  notes: null,
};

export const projectFormFieldMap = {
  name: "name",
  hexColor: "hexColor",
  isBillable: "isBillable",
  notes: "notes",
} as const;

export const formOpts = formOptions({
  defaultValues,
});

export const ProjectFormFields = withFieldGroup({
  defaultValues,
  render: function Render({ group }) {
    return (
      <>
        <group.AppField
          children={(field) => (
            <field.TextField
              direction="vertical"
              label={{ children: m.project_form_name_label() }}
              input={{ autoComplete: "off" }}
            />
          )}
          name="name"
        />
        <group.AppField
          children={(field) => (
            <field.TextField
              direction="vertical"
              label={{ children: m.project_form_color_label() }}
            />
          )}
          name="hexColor"
        />
        <group.AppField
          children={(field) => (
            <field.SwitchField
              direction="vertical"
              label={{ children: m.project_form_billable_label() }}
            />
          )}
          name="isBillable"
        />
        <group.AppField
          children={(field) => (
            <field.EditorField
              direction="vertical"
              label={{ children: m.project_form_notes_label() }}
            />
          )}
          name="notes"
        />
      </>
    );
  },
});
