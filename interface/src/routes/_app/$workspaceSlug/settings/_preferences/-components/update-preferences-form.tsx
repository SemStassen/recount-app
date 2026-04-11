import { UserSettings } from "@recount/core/modules/identity";
import { Form } from "@recount/ui/form";
import { defaultValidationLogic } from "@tanstack/react-form";
import { Effect } from "effect";

import { useAppForm } from "~/components/form";
import { useUserLiveQuery } from "~/db/user-collections";
import {
  createDynamicValidator,
  createSubmitValidator,
  createParsedSubmitHandler,
} from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

const schema = UserSettings.jsonUpdate;

export function UpdatePreferencesForm() {
  const { data: currentUserSettings } = useUserLiveQuery((q, collections) =>
    q.from({ userSettings: collections.userSettingsCollection }).findOne()
  );

  const defaultValues: (typeof schema)["Encoded"] = {
    dateFormat: currentUserSettings?.dateFormat,
    timeFormat: currentUserSettings?.timeFormat,
  };

  const form = useAppForm({
    defaultValues,
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: createDynamicValidator(schema),
      onSubmitAsync: createSubmitValidator(schema),
    },
    onSubmit: createParsedSubmitHandler(schema, async ({ value }) => {
      await runtime.runPromise(
        Effect.gen(function* () {
          const client = yield* RecountAtomRpcClient;

          yield* client("UserSettings.UpdateMe", {
            dateFormat: value.dateFormat,
            timeFormat: value.timeFormat,
          });
        })
      );
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
            direction="vertical"
            label={{ children: "Date Format" }}
            items={UserSettings.fields.dateFormat.literals.map((literal) => ({
              label: literal,
              value: literal,
            }))}
          />
        )}
        name="dateFormat"
      />
      <form.AppField
        children={(field) => (
          <field.SelectField
            direction="vertical"
            label={{ children: "Time Format" }}
            items={UserSettings.fields.timeFormat.literals.map((literal) => ({
              label: literal,
              value: literal,
            }))}
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
