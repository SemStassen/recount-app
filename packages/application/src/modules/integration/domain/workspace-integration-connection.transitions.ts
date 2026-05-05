import { WorkspaceIntegrationConnection } from "@recount/core/modules/integration";
import { generateUUID } from "@recount/core/shared/utils";
import { Option, Result } from "effect";
import type { DateTime } from "effect";

export const createWorkspaceIntegrationConnection = (params: {
  workspaceId: WorkspaceIntegrationConnection["workspaceId"];
  createdByWorkspaceMemberId: WorkspaceIntegrationConnection["createdByWorkspaceMemberId"];
  apiKey: WorkspaceIntegrationConnection["apiKey"];
  data: typeof WorkspaceIntegrationConnection.jsonCreate.Type;
  now: DateTime.Utc;
}): Result.Result<WorkspaceIntegrationConnection, never> => {
  const { apiKey: _apiKey, ...rest } = params.data;

  return Result.succeed(
    WorkspaceIntegrationConnection.make({
      id: WorkspaceIntegrationConnection.fields.id.make(generateUUID()),
      workspaceId: params.workspaceId,
      createdByWorkspaceMemberId: params.createdByWorkspaceMemberId,
      apiKey: params.apiKey,
      _metadata: Option.none(),
      createdAt: params.now,
      ...rest,
    })
  );
};

export const updateWorkspaceIntegrationConnection = (params: {
  workspaceIntegrationConnection: WorkspaceIntegrationConnection;
  apiKey: WorkspaceIntegrationConnection["apiKey"] | undefined;
  data: typeof WorkspaceIntegrationConnection.jsonUpdate.Type;
}): Result.Result<
  {
    entity: WorkspaceIntegrationConnection;
    changes: typeof WorkspaceIntegrationConnection.update.Type;
  },
  never
> => {
  const { apiKey: _apiKey, ...rest } = params.data;
  let changes: typeof WorkspaceIntegrationConnection.update.Type = { ...rest };

  if (params.apiKey !== undefined) {
    changes = {
      ...rest,
      apiKey: params.apiKey,
    };
  }

  return Result.succeed({
    entity: WorkspaceIntegrationConnection.make({
      ...params.workspaceIntegrationConnection,
      ...changes,
    }),
    changes,
  });
};
