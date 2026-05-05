import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import {
  TaskId,
  ExternalTaskReferenceId,
  WorkspaceId,
  WorkspaceIntegrationConnectionId,
} from "#shared/schemas/index";

import { WorkspaceIntegrationConnectionProvider } from "./workspace-integration-connection.entity";

export class ExternalTaskReference extends Model.Class<ExternalTaskReference>(
  "ExternalTaskReference"
)(
  {
    id: Model.ServerImmutable(ExternalTaskReferenceId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    workspaceIntegrationConnectionId: Model.ServerImmutable(
      WorkspaceIntegrationConnectionId
    ),
    taskId: Model.ServerImmutable(TaskId),
    provider: Model.ServerImmutable(WorkspaceIntegrationConnectionProvider),
    externalId: Model.ServerImmutable(Schema.NonEmptyString),
    createdAt: Model.ServerImmutable(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "ExternalTaskReference",
    title: "Task Integration",
    description: "A link between a task and an external provider object",
  }
) {}
