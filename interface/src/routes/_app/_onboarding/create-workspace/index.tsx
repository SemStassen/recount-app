import { useAtomSet } from "@effect/atom-react";
import { Workspace } from "@recount/core/modules/workspace";
import { DataResidencyRegion } from "@recount/core/shared/data-residency";
import { slugify } from "@recount/core/shared/utils";
import { FieldControl } from "@recount/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@recount/ui/input-group";
import { toastManager } from "@recount/ui/toast";
import { defaultValidationLogic } from "@tanstack/react-form";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Exit } from "effect";

import { useAppForm } from "~/components/form";
import { createSchemaForm } from "~/lib/form";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

export const Route = createFileRoute("/_app/_onboarding/create-workspace/")({
  component: RouteComponent,
});

const schema = createSchemaForm(Workspace.jsonCreate);

function RouteComponent() {
  const navigate = useNavigate();
  const createWorkspace = useAtomSet(
    BackendAtomRpcClient.mutation("Workspace.Create"),
    { mode: "promiseExit" }
  );

  const form = useAppForm({
    formId: "create-workspace",
    defaultValues: {
      name: "",
      slug: "",
      dataResidencyRegion: DataResidencyRegion.schema.literals[0],
    } satisfies typeof schema.validator.Encoded,
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: schema.validator,
      onSubmitAsync: schema.submitValidator,
    },
    onSubmit: schema.handleSubmit(async ({ value }) => {
      const result = await createWorkspace({
        payload: {
          name: value.name,
          slug: value.slug,
          dataResidencyRegion: value.dataResidencyRegion,
        },
      });

      Exit.match(result, {
        onSuccess: (workspace) => {
          navigate({
            to: "/$workspaceSlug",
            params: { workspaceSlug: workspace.slug },
          });
        },
        onFailure: () => {
          toastManager.add({
            type: "error",
            title: "Failed to create workspace",
            description: "An error occurred while creating your new workspace.",
          });
        },
      });
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
        <form.AppField
          children={(field) => (
            <field.SelectField
              direction="vertical"
              label={{
                children: "Region",
              }}
              select={{
                items: [
                  {
                    label: "Global",
                    value: DataResidencyRegion.schema.literals[0],
                  },
                  {
                    label: "European Union",
                    value: DataResidencyRegion.schema.literals[1],
                  },
                ],
              }}
            />
          )}
          name="dataResidencyRegion"
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
