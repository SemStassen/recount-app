import { useAtomSet } from "@effect/atom-react";
import { UserSettings } from "@recount/core/modules/identity";
import { Form } from "@recount/ui/form";
import { useLiveQuery } from "@tanstack/react-db";
import { defaultValidationLogic } from "@tanstack/react-form";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";
import { useUserDb } from "~/modules/session";

const schema = createSchemaForm(UserSettings.jsonUpdate);

export function UpdatePreferencesForm() {
  const updateUserSettingsMe = useAtomSet(
    BackendAtomRpcClient.mutation("UserSettings.UpdateMe"),
    { mode: "promiseExit" }
  );

  const userDb = useUserDb();
  const { data: currentUserSettings } = useLiveQuery((q) =>
    q.from({ us: userDb.collections.userSettingsCollection }).findOne()
  );

  const defaultValues: (typeof schema.validator)["Encoded"] = {
    dateFormat:
      currentUserSettings?.dateFormat ??
      UserSettings.fields.dateFormat.literals[0],
    timeFormat:
      currentUserSettings?.timeFormat ??
      UserSettings.fields.timeFormat.literals[0],
  };

  const form = useAppForm({
    defaultValues,
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(async ({ value }) => {
      await updateUserSettingsMe({
        payload: {
          dateFormat: value.dateFormat,
          timeFormat: value.timeFormat,
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
      <form.AppField
        children={(field) => (
          <field.SelectField
            direction="horizontal"
            label={{ children: "Date Format" }}
            select={{
              items: UserSettings.fields.dateFormat.literals.map((literal) => ({
                label: literal,
                value: literal,
              })),
            }}
          />
        )}
        name="dateFormat"
      />
      <form.AppField
        children={(field) => (
          <field.SelectField
            direction="horizontal"
            label={{ children: "Time Format" }}
            select={{
              items: UserSettings.fields.timeFormat.literals.map((literal) => ({
                label: literal,
                value: literal,
              })),
            }}
          />
        )}
        name="timeFormat"
      />
      <form.AppForm>
        <form.SubmitButton className="w-full" size="lg">
          Update preferences
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
