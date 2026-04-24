import { createWorkspaceIntegrationFlow } from "@recount/application/modules/integration";
import { WorkspaceIntegrationRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const WorkspaceIntegrationRpcGroupLayer =
  WorkspaceIntegrationRpcGroup.toLayer(
    Effect.succeed({
      "WorkspaceIntegration.Create": Effect.fn(
        "rpc.workspace-integration.create"
      )(
        function* (payload) {
          const workspaceIntegration =
            yield* createWorkspaceIntegrationFlow(payload);

          return workspaceIntegration;
        },
        Effect.catchTags({
          RepositoryError: () =>
            Effect.fail(new HttpApiError.InternalServerError()),
        })
      ),
    })
  );
