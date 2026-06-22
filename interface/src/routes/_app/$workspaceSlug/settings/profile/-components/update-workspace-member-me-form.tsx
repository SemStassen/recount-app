import { useAtomSet } from "@effect/atom-react";
import { WorkspaceMember } from "@recount/core/modules/workspace-member";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { Dropzone, DropzoneOpen } from "@recount/ui/dropzone";
import { Form } from "@recount/ui/form";
import { Icons } from "@recount/ui/icons";
import {
  Menu,
  MenuGroup,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from "@recount/ui/menu";
import { toastManager } from "@recount/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "@recount/ui/tooltip";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { defaultValidationLogic } from "@tanstack/react-form";
import { useRouteContext } from "@tanstack/react-router";
import { Exit, Schema } from "effect";

import { useAppForm } from "~/components/form";
import { WorkspaceMemberAvatar } from "~/components/workspace-member-avatar";
import { createSchemaForm, optionalFromEmptyString } from "~/lib/form";
import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";
import { useWorkspaceMutation } from "~/lib/rpc/workspace-mutation";
import { useWorkspaceDb } from "~/modules/workspace";

const profileFormSchema = createSchemaForm(
  Schema.Struct({
    displayName: WorkspaceMember.fields.displayName,
    avatarUrl: optionalFromEmptyString(WorkspaceMember.fields.avatarUrl),
  })
);

export function UpdateWorkspaceMemberMeForm() {
  const { user, workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });

  const workspaceDb = useWorkspaceDb();
  const { data: workspaceMember, isLoading } = useLiveQuery((q) =>
    q
      .from({ wm: workspaceDb.collections.workspaceMembersCollection })
      .where(({ wm }) => eq(wm.userId, user.id))
      .findOne()
  );

  const prepareFileUpload = useAtomSet(
    BackendAtomRpcClient.mutation("FileUpload.Prepare"),
    { mode: "promiseExit" }
  );
  const updateWorkspaceMember = useWorkspaceMutation("WorkspaceMember.Update");

  const form = useAppForm({
    formId: "update-profile",
    defaultValues: {
      displayName: workspaceMember?.displayName ?? "",
      avatarUrl: workspaceMember?.avatarUrl.valueOrUndefined ?? "",
    },
    validationLogic: defaultValidationLogic,
    validators: {
      onDynamic: profileFormSchema.validator,
      onSubmitAsync: profileFormSchema.submitValidator,
    },
    onSubmit: profileFormSchema.handleSubmit(async ({ value }) => {
      const result = await updateWorkspaceMember({
        payload: {
          displayName: value.displayName,
          avatarUrl: value.avatarUrl,
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

  const uploadAvatar = async (file: File) => {
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
      onFailure: () => {
        toastManager.add({
          type: "error",
          title: "Failed to prepare upload",
          description: "An error occurred while preparing the file upload.",
        });
      },
      onSuccess: async (prepared) => {
        await fetch(prepared.uploadUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
          credentials: "omit",
        });

        form.setFieldValue("avatarUrl", prepared.assetUrl);
      },
    });
  };

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
          >
            <Tooltip>
              <TooltipTrigger render={<div />}>
                <Dropzone
                  accept={{ "image/*": [] }}
                  noClick={Boolean(field.state.value)}
                  noKeyboard={Boolean(field.state.value)}
                  onDropAccepted={(files) => {
                    const [file] = files;

                    if (!file) {
                      return;
                    }

                    return uploadAvatar(file);
                  }}
                >
                  {field.state.value ? (
                    <Menu>
                      <MenuTrigger nativeButton={false} render={<div />}>
                        <WorkspaceMemberAvatar
                          displayName={workspaceMember?.displayName}
                          avatarUrl={field.state.value}
                        />
                      </MenuTrigger>
                      <MenuPopup align="start" side="bottom">
                        <MenuGroup>
                          <MenuItem render={<DropzoneOpen />}>
                            <Icons.Edit />
                            Change avatar
                          </MenuItem>
                          <MenuItem
                            onClick={() => form.setFieldValue("avatarUrl", "")}
                          >
                            <Icons.X />
                            Remove avatar
                          </MenuItem>
                        </MenuGroup>
                      </MenuPopup>
                    </Menu>
                  ) : (
                    <WorkspaceMemberAvatar
                      displayName={workspaceMember?.displayName}
                      avatarUrl={field.state.value}
                    />
                  )}
                </Dropzone>
              </TooltipTrigger>
              <TooltipContent align="start" side="inline-start">
                Upload an avatar
              </TooltipContent>
            </Tooltip>
          </field.CustomField>
        )}
        name="avatarUrl"
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
