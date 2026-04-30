import { defaultValidationLogic } from "@tanstack/react-form";
import { Effect, Schema } from "effect";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

const schema = createSchemaForm(
  Schema.Struct({
    apiKey: Schema.String,
  })
);

function CreateWorkspaceIntegrationForm({ provider }: { provider: "float" }) {
  // const createWorkspaceIntegration = useAtomSet(
  //   createWorkspaceIntegrationAtom,
  //   {
  //     mode: "promiseExit",
  //   }
  // );

  const form = useAppForm({
    defaultValues: {
      apiKey: "",
    } satisfies typeof schema.validator.Encoded,
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(async ({ value }) => {
      await runtime.runPromise(
        Effect.gen(function* () {
          const client = yield* RecountAtomRpcClient;

          const res = yield* client("WorkspaceIntegration.Create", {
            provider: "float",
            apiKey: value.apiKey,
          });
        })
      );
    }),
  });

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.AppField
        children={(field) => (
          <field.TextField
            label={{
              children: "Api key",
            }}
          />
        )}
        name="apiKey"
      />
      <form.AppForm>
        <form.SubmitButton>Add API key</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}

export { CreateWorkspaceIntegrationForm };
