import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import {
  TaskId,
  ExternalTaskReferenceId,
  WorkspaceId,
  WorkspaceIntegrationConnectionId,
} from "#shared/schemas/index";

import { WorkspaceIntegrationConnectionProvider } from "./workspace-integration-connection.entity";

export class ExternalTaskReference extends SharedModel.Class<ExternalTaskReference>(
  "ExternalTaskReference"
)(
  {
    id: SharedModel.ImmutableReadOnly(ExternalTaskReferenceId),
    workspaceId: SharedModel.ImmutableReadOnly(WorkspaceId),
    workspaceIntegrationConnectionId: SharedModel.ImmutableReadOnly(
      WorkspaceIntegrationConnectionId
    ),
    taskId: SharedModel.ImmutableReadOnly(TaskId),
    provider: SharedModel.ImmutableReadOnly(
      WorkspaceIntegrationConnectionProvider
    ),
    externalId: SharedModel.ImmutableReadOnly(Schema.NonEmptyString),
    createdAt: SharedModel.ImmutableReadOnly(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "ExternalTaskReference",
    title: "Task Integration",
    description: "A link between a task and an external provider object",
  }
) {}
