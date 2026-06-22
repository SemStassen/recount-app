import { Schema } from "effect";

import { SharedModel } from "#internal/effect/index";
import {
  ProjectId,
  ExternalProjectReferenceId,
  WorkspaceId,
  WorkspaceIntegrationConnectionId,
} from "#shared/schemas/index";

import { WorkspaceIntegrationConnectionProvider } from "./workspace-integration-connection.entity";

export class ExternalProjectReference extends SharedModel.Class<ExternalProjectReference>(
  "ExternalProjectReference"
)(
  {
    id: SharedModel.ImmutableReadOnly(ExternalProjectReferenceId),
    workspaceId: SharedModel.ImmutableReadOnly(WorkspaceId),
    workspaceIntegrationConnectionId: SharedModel.ImmutableReadOnly(
      WorkspaceIntegrationConnectionId
    ),
    projectId: SharedModel.ImmutableReadOnly(ProjectId),
    provider: SharedModel.ImmutableReadOnly(
      WorkspaceIntegrationConnectionProvider
    ),
    externalId: SharedModel.ImmutableReadOnly(Schema.NonEmptyString),
    createdAt: SharedModel.ImmutableReadOnly(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "ExternalProjectReference",
    title: "Project Integration",
    description: "A link between a project and an external provider object",
  }
) {}
