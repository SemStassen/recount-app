import { Schema } from "effect";

import { WorkspaceIntegrationConnection } from "./workspace-integration-connection.entity";

export class WorkspaceIntegrationConnectionNotFoundError extends Schema.TaggedErrorClass<WorkspaceIntegrationConnectionNotFoundError>()(
  "integration/WorkspaceIntegrationConnectionNotFoundError",
  {
    workspaceIntegrationConnectionId: WorkspaceIntegrationConnection.fields.id,
  }
) {}

export class WorkspaceIntegrationConnectionProviderAlreadyExistsError extends Schema.TaggedErrorClass<WorkspaceIntegrationConnectionProviderAlreadyExistsError>()(
  "integration/WorkspaceIntegrationConnectionProviderAlreadyExistsError",
  {}
) {}
