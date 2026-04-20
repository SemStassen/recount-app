import { User } from "@recount/core/modules/identity";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@recount/ui/dropzone";
import { Form } from "@recount/ui/form";
import { defaultValidationLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";
import { Effect, Schema } from "effect";

import { useAppForm } from "~/components/form";
import { WorkspaceMemberAvatar } from "~/components/workspace-member-avatar";
import {
  createDynamicValidator,
  createSubmitValidator,
  createParsedSubmitHandler,
} from "~/lib/form";
import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";
import { runtime } from "~/lib/runtime";

const schema = Schema.Struct({
  fullName: User.fields.fullName,
  displayName: WorkspaceMember.fields.displayName,
  imageUrl: WorkspaceMember.fields.imageUrl,
});

export function UpdateProfileForm() {
  const routeContext = useRouteContext({ from: "/_app/$workspaceSlug" });

  const form = useAppForm({
    defaultValues: {
      fullName: routeContext.user.fullName,
      displayName: "",
      imageUrl: "",
    },
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: createDynamicValidator(schema),
      onSubmitAsync: createSubmitValidator(schema),
    },
    onSubmit: createParsedSubmitHandler(schema, async ({ value }) => {
      await runtime.runPromise(
        Effect.gen(function* () {
          const client = yield* RecountAtomRpcClient;
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
          <field.CustomField
            direction="horizontal"
            label={{ children: "Profile picture" }}
            control={{
              render: (
                <Dropzone>
                  <WorkspaceMemberAvatar
                    workspaceMemberId={routeContext.user.id}
                  />
                  <DropzoneContent />
                  <DropzoneEmptyState />
                </Dropzone>
              ),
            }}
          />
        )}
        name="imageUrl"
      />

      <form.AppField
        children={(field) => (
          <field.TextField
            direction="horizontal"
            label={{ children: "Full name" }}
          />
        )}
        name="fullName"
      />
      <form.AppField
        children={(field) => (
          <field.TextField
            direction="horizontal"
            label={{ children: "Display name" }}
            description={{
              children: "Your personal nickname or first name",
            }}
          />
        )}
        name="displayName"
      />
      <form.AppForm>
        <form.SubmitButton className="w-full" size="lg">
          Update preferences
        </form.SubmitButton>
      </form.AppForm>
    </Form>
  );
}
