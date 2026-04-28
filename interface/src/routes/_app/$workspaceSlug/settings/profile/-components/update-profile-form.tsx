import { useAtomSet } from "@effect/atom-react";
import { User } from "@recount/core/modules/identity";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import {
  Dropzone,
  DropzoneContent,
  DropzoneEmptyState,
} from "@recount/ui/dropzone";
import { Form } from "@recount/ui/form";
import { Tooltip, TooltipContent, TooltipTrigger } from "@recount/ui/tooltip";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { defaultValidationLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";
import { Effect, Exit, Option, Schema } from "effect";

import { useAppForm } from "~/components/form";
import { WorkspaceMemberAvatar } from "~/components/workspace-member-avatar";
import { useWorkspaceDb } from "~/db/workspace/context";
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
  const { user, workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const workspaceDb = useWorkspaceDb();
  const { data: workspaceMember, isLoading } = useLiveQuery((q) =>
    q
      .from({ wm: workspaceDb.collections.workspaceMembersCollection })
      .where(({ wm }) => eq(wm.userId, user.id))
      .findOne()
  );

  const form = useAppForm({
    defaultValues: {
      fullName: user.fullName,
      displayName: workspaceMember?.displayName ?? "",
      imageUrl: workspaceMember?.imageUrl.valueOrUndefined ?? "",
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

  const prepareFileUpload = useAtomSet(
    RecountAtomRpcClient.mutation("FileUpload.Prepare"),
    { mode: "promiseExit" }
  );
  const updateWorkspaceMember = useAtomSet(
    RecountAtomRpcClient.mutation("WorkspaceMember.Update"),
    { mode: "promiseExit" }
  );

  if (isLoading) {
    return null;
  }

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
                <Tooltip>
                  <TooltipTrigger render={<div />}>
                    <Dropzone
                      onDropAccepted={async (files) => {
                        const file = files[0];

                        if (!file) {
                          return;
                        }

                        const preparedFileUpload = await prepareFileUpload({
                          payload: {
                            filename: file.name,
                            contentType: file.type,
                            size: file.size,
                            target: {
                              _tag: "workspaceMemberAvatar",
                            },
                          },
                          headers: {
                            [WORKSPACE_ID_HEADER]: workspace.id,
                          },
                        });

                        return Exit.match(preparedFileUpload, {
                          onFailure: () => undefined,
                          onSuccess: async (prepared) => {
                            await fetch(prepared.uploadUrl, {
                              method: "PUT",
                              headers: {
                                "Content-Type": file.type,
                              },
                              body: file,
                              credentials: "omit",
                            });

                            form.setFieldValue("imageUrl", prepared.assetUrl);
                          },
                        });
                      }}
                    >
                      <WorkspaceMemberAvatar
                        displayName={Option.fromUndefinedOr(
                          workspaceMember?.displayName
                        )}
                        avatarUrl={Option.fromUndefinedOr(field.state.value)}
                      />
                    </Dropzone>
                  </TooltipTrigger>
                  <TooltipContent align="start" side="inline-start">
                    Upload an avatar
                  </TooltipContent>
                </Tooltip>
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
