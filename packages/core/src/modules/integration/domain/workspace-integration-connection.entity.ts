import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
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

export class WorkspaceIntegrationConnection extends SharedModel.Class<WorkspaceIntegrationConnection>(
  "WorkspaceIntegrationConnection"
)(
  {
    id: SharedModel.ImmutableReadOnly(WorkspaceIntegrationConnectionId),
    workspaceId: SharedModel.ImmutableReadOnly(WorkspaceId),
    createdByWorkspaceMemberId:
      SharedModel.ImmutableReadOnly(WorkspaceMemberId),
    provider: SharedModel.ImmutableCreate(
      WorkspaceIntegrationConnectionProvider
    ),
    apiKey: SharedModel.Field({
      select: EncryptedApiKey,
      insert: EncryptedApiKey,
      update: Schema.optionalKey(EncryptedApiKey),
      jsonCreate: PlainApiKey,
      jsonUpdate: Schema.optionalKey(PlainApiKey),
    }),
    _metadata: SharedModel.MutableNullableReadOnly(
      Schema.Struct({
        lastSyncedAt: Schema.optionalKey(Schema.DateTimeUtcFromDate),
      })
    ),
    createdAt: SharedModel.ImmutableReadOnly(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "WorkspaceIntegrationConnection",
    title: "Workspace Integration",
    description: "An integration connecting a workspace to an external service",
  }
) {}
