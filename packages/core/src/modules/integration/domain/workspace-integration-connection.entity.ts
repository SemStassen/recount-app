import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import {
  EncryptedApiKey,
  PlainApiKey,
  WorkspaceId,
  WorkspaceIntegrationConnectionId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export type WorkspaceIntegrationConnectionProvider =
  typeof WorkspaceIntegrationConnectionProvider.Type;
export const WorkspaceIntegrationConnectionProvider = Schema.Literals([
  "linear",
]).pipe(Schema.brand("WorkspaceIntegrationConnectionProvider"));

export class WorkspaceIntegrationConnection extends Model.Class<WorkspaceIntegrationConnection>(
  "WorkspaceIntegrationConnection"
)(
  {
    id: Model.ServerImmutable(WorkspaceIntegrationConnectionId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    createdByWorkspaceMemberId: Model.ServerImmutable(WorkspaceMemberId),
    provider: Model.ServerImmutableClientImmutable(
      WorkspaceIntegrationConnectionProvider
    ),
    apiKey: Model.Field({
      select: EncryptedApiKey,
      insert: EncryptedApiKey,
      update: Schema.optionalKey(EncryptedApiKey),
      jsonCreate: PlainApiKey,
      jsonUpdate: Schema.optionalKey(PlainApiKey),
    }),
    _metadata: Model.ServerMutableOptional(
      Schema.Struct({
        lastSyncedAt: Schema.optionalKey(Schema.DateTimeUtcFromDate),
      })
    ),
    createdAt: Model.ServerImmutable(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "WorkspaceIntegrationConnection",
    title: "Workspace Integration",
    description: "An integration connecting a workspace to an external service",
  }
) {}
