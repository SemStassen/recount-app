import type {
  WorkspaceId,
  WorkspaceMemberId,
} from "@recount/core/shared/schemas";
import { generateUUID } from "@recount/core/shared/utils";
import { Context, Effect, Layer } from "effect";

export interface UploadKeyPolicyShape {
  readonly workspaceMemberAvatar: (params: {
    workspaceId: WorkspaceId;
    workspaceMemberId: WorkspaceMemberId;
  }) => Effect.Effect<string>;
}

export class UploadKeyPolicy extends Context.Service<
  UploadKeyPolicy,
  UploadKeyPolicyShape
>()("@recount/infra/storage/UploadKeyPolicy") {
  static readonly layer = Layer.effect(
    UploadKeyPolicy,
    Effect.succeed({
      workspaceMemberAvatar: (params) =>
        Effect.sync(() => {
          const uuid = generateUUID();

          return `workspaces/${params.workspaceId}/workspace-members/${params.workspaceMemberId}/avatar/${uuid}`;
        }),
    })
  );
}
