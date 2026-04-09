import {
  RpcSessionMiddleware,
  RpcWorkspaceMiddleware,
} from "@recount/core/rpc";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import type { WorkspaceId } from "@recount/core/shared/schemas";
import { Effect } from "effect";
import { Headers } from "effect/unstable/http";
import { RpcMiddleware } from "effect/unstable/rpc";

import { router } from "~/router";

export const RpcSessionMiddlewareLayerClient = RpcMiddleware.layerClient(
  RpcSessionMiddleware,
  ({ request, next }) =>
    Effect.gen(function* () {
      const token = localStorage.getItem("access_token");

      if (token) {
        const newHeaders = Headers.set(
          request.headers,
          "authorization",
          `Bearer ${token}`
        );
        return yield* next({ ...request, headers: newHeaders });
      }

      yield* Effect.logWarning(
        "RpcSessionMiddlewareLayerClient: no access_token found, request will be unauthenticated"
      );

      return yield* next(request);
    })
);

export const RpcWorkspaceMiddlewareLayerClient = RpcMiddleware.layerClient(
  RpcWorkspaceMiddleware,
  ({ request, next }) =>
    Effect.gen(function* () {
      /* This is a very naive implementation that assumes the workspaceId is always present in the route context.
      This pattern will also not scale to full offline support, but works for a v1 */

      let workspaceId: WorkspaceId | undefined;
      const { matches } = router.state;

      for (const match of matches) {
        if (match.fullPath === "/$workspaceSlug") {
          workspaceId = match.context.workspace.id;

          break;
        }
      }

      return yield* next({
        ...request,
        headers: {
          ...request.headers,
          ...(workspaceId ? { [WORKSPACE_ID_HEADER]: workspaceId } : {}),
        },
      });
    })
);
