import type {
  WorkspaceIntegrationConnection,
  WorkspaceIntegrationConnectionNotFoundError,
  WorkspaceIntegrationConnectionProviderAlreadyExistsError,
} from "@recount/core/modules/integration";
import type { RepositoryError } from "@recount/core/shared/repository";
import type {
  PlainApiKey,
  WorkspaceIntegrationConnectionId,
} from "@recount/core/shared/schemas";
import { Context } from "effect";
import type { Effect } from "effect";

export interface IntegrationModuleShape {
  readonly createWorkspaceIntegrationConnection: (params: {
    workspaceId: WorkspaceIntegrationConnection["workspaceId"];
    createdByWorkspaceMemberId: WorkspaceIntegrationConnection["createdByWorkspaceMemberId"];
    data: typeof WorkspaceIntegrationConnection.jsonCreate.Type;
  }) => Effect.Effect<
    WorkspaceIntegrationConnection,
    WorkspaceIntegrationConnectionProviderAlreadyExistsError | RepositoryError
  >;
  readonly updateWorkspaceIntegrationConnection: (params: {
    id: WorkspaceIntegrationConnection["id"];
    workspaceId: WorkspaceIntegrationConnection["workspaceId"];
    data: typeof WorkspaceIntegrationConnection.jsonUpdate.Type;
  }) => Effect.Effect<
    WorkspaceIntegrationConnection,
    WorkspaceIntegrationConnectionNotFoundError | RepositoryError
  >;
  readonly hardDeleteWorkspaceIntegrationConnection: (params: {
    id: WorkspaceIntegrationConnectionId;
    workspaceId: WorkspaceIntegrationConnection["workspaceId"];
  }) => Effect.Effect<
    void,
    WorkspaceIntegrationConnectionNotFoundError | RepositoryError
  >;
  readonly revealWorkspaceIntegrationConnectionApiKey: (params: {
    workspaceId: WorkspaceIntegrationConnection["workspaceId"];
    id: WorkspaceIntegrationConnection["id"];
  }) => Effect.Effect<
    PlainApiKey,
    WorkspaceIntegrationConnectionNotFoundError | RepositoryError
  >;
}

export class IntegrationModule extends Context.Service<
  IntegrationModule,
  IntegrationModuleShape
>()("@recount/integration/IntegrationModule") {}
