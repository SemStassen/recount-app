import type {
  PrepareFileUploadCommand,
  PrepareFileUploadResult,
} from "@recount/core/contracts";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { FileUploadKeyPolicy, ObjectStorage } from "#infra/storage";
import { ApplicationContext } from "#shared/application-context";

import { validateFileUploadPolicy } from "../file-upload-policy";

export const prepareFileUploadFlow = Effect.fn("flows.prepareFileUploadFlow")(
  function* (request: typeof PrepareFileUploadCommand.Type) {
    const appContext = yield* ApplicationContext;
    const { workspaceMember, workspace } = yield* WorkspaceContext;
    const objectStorage = yield* ObjectStorage;
    const fileUploadKeyPolicy = yield* FileUploadKeyPolicy;

    yield* validateFileUploadPolicy(request);

    const key = yield* Effect.gen(function* () {
      switch (request.target._tag) {
        case "workspaceMemberAvatar": {
          return yield* fileUploadKeyPolicy.workspaceMemberAvatar({
            workspaceId: workspace.id,
            workspaceMemberId: workspaceMember.id,
          });
        }
        case "workspaceLogo": {
          yield* appContext.authorizedWorkspace("workspace:patch");

          return yield* fileUploadKeyPolicy.workspaceLogo({
            workspaceId: workspace.id,
          });
        }
      }
    });

    const preparedUpload = yield* objectStorage.createPresignedUpload({
      region: workspace.dataResidencyRegion,
      key,
      contentType: request.contentType,
    });

    return {
      uploadUrl: preparedUpload.uploadUrl,
      assetUrl: preparedUpload.assetUrl,
    } satisfies typeof PrepareFileUploadResult.Type;
  }
);
