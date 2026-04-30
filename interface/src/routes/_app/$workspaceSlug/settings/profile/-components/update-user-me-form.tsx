import { useAtomSet } from "@effect/atom-react";
import { User } from "@recount/core/modules/identity";
import { Form } from "@recount/ui/form";
import { toastManager } from "@recount/ui/toast";
import { defaultValidationLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";
import { Exit, Schema } from "effect";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";

const schema = createSchemaForm(
  Schema.Struct({
    fullName: User.fields.fullName,
  })
);

export function UpdateUserMeForm() {
  const { user } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const updateUserMe = useAtomSet(
    RecountAtomRpcClient.mutation("User.UpdateMe"),
    { mode: "promiseExit" }
  );

  const form = useAppForm({
    formId: "update-user-me",
    defaultValues: {
      fullName: user.fullName,
    },
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(async ({ value }) => {
      const result = await updateUserMe({
        payload: {
          fullName: value.fullName,
        },
      });

      Exit.match(result, {
        onSuccess: () => {
          toastManager.add({
            type: "success",
            title: "Profile updated",
          });
        },
        onFailure: () => {
          toastManager.add({
            type: "error",
            title: "Failed to update profile",
            description: "An error occurred while updating your profile.",
          });
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
          <field.TextField
            direction="horizontal"
            label={{ children: "Full name" }}
          />
        )}
        name="fullName"
      />
      <form.AppForm>
        <form.SubmitButton className="w-full" size="lg">
          Update preferences
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
