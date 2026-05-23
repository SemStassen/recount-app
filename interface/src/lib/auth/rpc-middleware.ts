import { RpcSessionMiddleware } from "@recount/core/rpc";
import { Effect } from "effect";
import { Headers } from "effect/unstable/http";
import { RpcMiddleware } from "effect/unstable/rpc";

import { getAuthHeaders } from "./bearer-token";

export const RpcSessionMiddlewareLayerClient = RpcMiddleware.layerClient(
  RpcSessionMiddleware,
  ({ request, next }) =>
    Effect.gen(function* () {
      const token = getAuthHeaders().Authorization;

      if (token) {
        const newHeaders = Headers.set(request.headers, "authorization", token);
        return yield* next({ ...request, headers: newHeaders });
      }

      yield* Effect.logWarning(
        "RpcSessionMiddlewareLayerClient: no auth token found, request will be unauthenticated"
      );

      return yield* next(request);
    })
);
