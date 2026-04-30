import { Workspace } from "@recount/core/modules/workspace";
import { slugify } from "@recount/core/shared/utils";
import { FieldControl } from "@recount/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@recount/ui/input-group";
import { defaultValidationLogic } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Effect } from "effect";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

export const Route = createFileRoute("/_app/_onboarding/create-workspace/")({
  component: RouteComponent,
});

const schema = createSchemaForm(Workspace.jsonCreate);

function RouteComponent() {
  const navigate = useNavigate();
  const form = useAppForm({
    formId: "create-workspace",
    defaultValues: {
      name: "",
      slug: "",
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

          const res = yield* client("Workspace.Create", {
            name: value.name,
            slug: value.slug,
          });

          navigate({
            to: "/$workspaceSlug",
            params: { workspaceSlug: res.slug },
          });
        })
      );
    }),
  });

  return (
    <div className="flex w-[320px] flex-col items-center gap-8">
      <h1 className="text-center font-medium text-2xl">Create workspace</h1>
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
                children: "Workspace name",
              }}
            />
          )}
          listeners={{
            onChange: ({ value, fieldApi }) => {
              if (!fieldApi.form.getFieldMeta("slug")?.isDirty) {
                fieldApi.form.setFieldValue("slug", slugify(value), {
                  dontUpdateMeta: true,
                });
              }
            },
          }}
          name="name"
        />
        <form.AppField
          children={(field) => (
            <field.CustomField
              direction="vertical"
              label={{
                children: "Workspace URL",
              }}
            >
              <FieldControl
                render={(props) => (
                  <InputGroup>
                    <InputGroupInput
                      className="*:data-[slot=input]:pl-0!"
                      autoComplete="off"
                      {...props}
                    />
                    <InputGroupAddon>
                      <InputGroupText>recount.app/</InputGroupText>
                    </InputGroupAddon>
                  </InputGroup>
                )}
              />
            </field.CustomField>
          )}
          listeners={{
            onChange: ({ value, fieldApi }) => {
              if (!value) {
                fieldApi.setMeta((meta) => ({
                  ...meta,
                  isDirty: false,
                }));
              }
            },
          }}
          name="slug"
        />
        <form.AppForm>
          <form.SubmitButton className="w-full" size="lg">
            Create Workspace
          </form.SubmitButton>
        </form.AppForm>
      </form>
    </div>
  );
}
