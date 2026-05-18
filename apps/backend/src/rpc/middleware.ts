import { Cause, Effect, Layer, Schema } from "effect";
import { RpcMiddleware } from "effect/unstable/rpc";

export class RpcCauseLoggingMiddleware extends RpcMiddleware.Service<RpcCauseLoggingMiddleware>()(
  "@recount/backend/RpcCauseLoggingMiddleware",
  {
    error: Schema.Never,
  }
) {}

export const RpcCauseLoggingMiddlewareLayer = Layer.succeed(
  RpcCauseLoggingMiddleware,
  (effect, options) =>
    effect.pipe(
      Effect.withSpan(`rpc.server ${options.rpc._tag}`, {
        attributes: {
          "rpc.system": "effect",
          "rpc.method": options.rpc._tag,
          "rpc.request_id": String(options.requestId),
        },
      }),
      Effect.tapCause((cause) =>
        Effect.logError("RPC request failed").pipe(
          Effect.annotateLogs({
            cause: Cause.pretty(cause),
            requestId: String(options.requestId),
            rpc: options.rpc._tag,
          })
        )
      )
    )
);
