import { useAtomSet } from "@effect/atom-react";
import { User } from "@recount/core/modules/identity";
import { defaultValidationLogic } from "@tanstack/react-form";
import { createFileRoute } from "@tanstack/react-router";
import { Schema } from "effect";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

export const Route = createFileRoute("/_app/_onboarding/profile/")({
  component: RouteComponent,
});

const schema = createSchemaForm(
  Schema.Struct({
    fullName: User.fields.fullName,
  })
);

function RouteComponent() {
  const updateUserMe = useAtomSet(
    BackendAtomRpcClient.mutation("User.UpdateMe"),
    { mode: "promiseExit" }
  );

  const form = useAppForm({
    formId: "profile",
    defaultValues: {
      fullName: "",
    } satisfies typeof schema.validator.Encoded,
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(async ({ value }) => {
      await updateUserMe({
        payload: {
          fullName: value.fullName,
        },
      });
    }),
  });

  return (
    <div className="flex w-[320px] flex-col items-center gap-8">
      <h1 className="text-center font-medium text-2xl">Setup profile</h1>
      <form
        className="w-full space-y-8"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.AppField
          children={(field) => (
            <field.TextField
              direction="vertical"
              input={{
                autoComplete: "off",
                autoFocus: true,
              }}
              label={{
                children: "Full name",
              }}
            />
          )}
          name="fullName"
        />
        <form.AppForm>
          <form.SubmitButton className="w-full" size="lg">
            Update profile
          </form.SubmitButton>
        </form.AppForm>
      </form>
    </div>
  );
}
