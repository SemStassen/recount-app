import { WorkspaceIntegrationConnectionProvider } from "@recount/core/modules/integration";
import { PlainApiKey } from "@recount/core/shared/schemas";
import { defaultValidationLogic } from "@tanstack/react-form";
import { Effect, Redacted, Schema } from "effect";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

const schema = createSchemaForm(
  Schema.Struct({
    apiKey: Schema.String,
  })
);

function CreateWorkspaceIntegrationConnectionForm({
  provider,
}: {
  provider: "float";
}) {
  // const createWorkspaceIntegrationConnection = useAtomSet(
  //   createWorkspaceIntegrationConnectionAtom,
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

          yield* client("WorkspaceIntegrationConnection.Create", {
            provider: WorkspaceIntegrationConnectionProvider.make(provider),
            apiKey: PlainApiKey.make(Redacted.make(value.apiKey)),
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
            direction="vertical"
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

export { CreateWorkspaceIntegrationConnectionForm };
