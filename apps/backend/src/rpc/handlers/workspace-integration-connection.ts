import { createWorkspaceIntegrationConnectionFlow } from "@recount/application/modules/integration";
import { WorkspaceIntegrationConnectionRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceIntegrationConnectionRpcGroupLayer =
  WorkspaceIntegrationConnectionRpcGroup.toLayer(
    Effect.succeed({
      "WorkspaceIntegrationConnection.Create": Effect.fn(
        "rpc.workspace-integration-connection.create"
      )(
        function* (payload) {
          const workspaceIntegrationConnection =
            yield* createWorkspaceIntegrationConnectionFlow(payload);

          return workspaceIntegrationConnection;
        },
        Effect.catchTags({
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      ),
    })
  );
