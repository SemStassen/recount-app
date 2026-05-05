import { Schema } from "effect";

import { Model } from "#internal/effect/index";
import {
  ProjectId,
  ExternalProjectReferenceId,
  WorkspaceId,
  WorkspaceIntegrationConnectionId,
} from "#shared/schemas/index";

import { WorkspaceIntegrationConnectionProvider } from "./workspace-integration-connection.entity";

export class ExternalProjectReference extends Model.Class<ExternalProjectReference>(
  "ExternalProjectReference"
)(
  {
    id: Model.ServerImmutable(ExternalProjectReferenceId),
    workspaceId: Model.ServerImmutable(WorkspaceId),
    workspaceIntegrationConnectionId: Model.ServerImmutable(
      WorkspaceIntegrationConnectionId
    ),
    projectId: Model.ServerImmutable(ProjectId),
    provider: Model.ServerImmutable(WorkspaceIntegrationConnectionProvider),
    externalId: Model.ServerImmutable(Schema.NonEmptyString),
    createdAt: Model.ServerImmutable(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "ExternalProjectReference",
    title: "Project Integration",
    description: "A link between a project and an external provider object",
  }
) {}
