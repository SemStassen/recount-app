import type {
  PrepareFileUploadCommand,
  PrepareFileUploadResult,
} from "@recount/core/modules/file-upload/api";
import { Effect } from "effect";

import { FileUploadKeyPolicy, ObjectStorage } from "#infra/storage";
import { ApplicationContext } from "#shared/application-context";

import { validateFileUploadPolicy } from "../file-upload-policy";

export const prepareFileUploadFlow = Effect.fn("flows.prepareFileUploadFlow")(
  function* (request: typeof PrepareFileUploadCommand.Type) {
    const appContext = yield* ApplicationContext;
    const objectStorage = yield* ObjectStorage;
    const fileUploadKeyPolicy = yield* FileUploadKeyPolicy;

    yield* validateFileUploadPolicy(request);

    const uploadTarget = yield* Effect.gen(function* () {
      switch (request.target._tag) {
        case "workspaceMemberAvatar": {
          const { workspaceMember, workspace } =
            yield* appContext.authorizedWorkspace(
              "workspace-member:update_avatar_self"
            );

          const key = yield* fileUploadKeyPolicy.workspaceMemberAvatar({
            workspaceId: workspace.id,
            workspaceMemberId: workspaceMember.id,
          });

          return { key, workspace };
        }
        case "workspaceLogo": {
          const { workspace } =
            yield* appContext.authorizedWorkspace("workspace:patch");

          const key = yield* fileUploadKeyPolicy.workspaceLogo({
            workspaceId: workspace.id,
          });

          return { key, workspace };
        }
      }
    });

    const preparedUpload = yield* objectStorage.createPresignedUpload({
      region: uploadTarget.workspace.dataResidencyRegion,
      key: uploadTarget.key,
      contentType: request.contentType,
    });

    return {
      uploadUrl: preparedUpload.uploadUrl,
      assetUrl: preparedUpload.assetUrl,
    } satisfies typeof PrepareFileUploadResult.Type;
  }
);
