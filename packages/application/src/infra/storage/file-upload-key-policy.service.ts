import type {
  WorkspaceId,
  WorkspaceMemberId,
} from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { Context, Effect, Layer } from "effect";

export interface FileUploadKeyPolicyShape {
  readonly workspaceMemberAvatar: (params: {
    workspaceId: WorkspaceId;
    workspaceMemberId: WorkspaceMemberId;
  }) => Effect.Effect<string>;
  readonly workspaceLogo: (params: {
    workspaceId: WorkspaceId;
  }) => Effect.Effect<string>;
}

export class FileUploadKeyPolicy extends Context.Service<
  FileUploadKeyPolicy,
  FileUploadKeyPolicyShape
>()("@recount/infra/storage/FileUploadKeyPolicy") {
  static readonly layer = Layer.effect(
    FileUploadKeyPolicy,
    Effect.succeed({
      workspaceMemberAvatar: (params) =>
        Effect.sync(() => {
          const uuid = generateUUID();

          return `workspaces/${params.workspaceId}/workspace-members/${params.workspaceMemberId}/avatar/${uuid}`;
        }),
      workspaceLogo: (params) =>
        Effect.sync(() => {
          const uuid = generateUUID();

          return `workspaces/${params.workspaceId}/logo/${uuid}`;
        }),
    })
  );
}
