import {
  RpcSessionMiddleware,
  RpcWorkspaceMiddleware,
} from "@recount/core/rpc";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
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
      const workspaceId = rou;

      if (!workspaceId) {
        return yield* next(request);
      }

      const newHeaders = Headers.set(
        request.headers,
        WORKSPACE_ID_HEADER,
        workspaceId
      );

      return yield* next({ ...request, headers: newHeaders });
    })
);
