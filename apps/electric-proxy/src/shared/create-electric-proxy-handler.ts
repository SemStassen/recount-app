import { ELECTRIC_PROTOCOL_QUERY_PARAMS } from "@electric-sql/client";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { Cause, Config, Effect, Option, Stream } from "effect";
import { Headers, HttpServerResponse } from "effect/unstable/http";
import type { HttpServerRequest } from "effect/unstable/http";
import { HttpApiError } from "effect/unstable/httpapi";

const electricConfig = Config.all({
  electricUrl: Config.string("ELECTRIC_URL"),
  sourceId: Config.string("ELECTRIC_SOURCE_ID").pipe(Config.option),
  sourceSecret: Config.string("ELECTRIC_SOURCE_SECRET").pipe(Config.option),
});

export const createElectricProxyHandler =
  <R, E = never>(params: {
    table: string;
    buildShapeParams: (
      request: HttpServerRequest.HttpServerRequest
    ) => Effect.Effect<
      {
        where?: string;
      },
      E,
      R
    >;
  }) =>
  (request: HttpServerRequest.HttpServerRequest) =>
    Effect.gen(function* () {
      const { electricUrl, sourceId, sourceSecret } = yield* electricConfig;
      const shapeParams = yield* params.buildShapeParams(request);

      const requestUrl = new URL(request.url, "http://localhost");
      const originUrl = new URL("/v1/shape", electricUrl);

      // Forward only Electric protocol parameters from the client.
      // This avoids clients overriding server-controlled values like table/where.
      for (const [key, value] of requestUrl.searchParams.entries()) {
        if (ELECTRIC_PROTOCOL_QUERY_PARAMS.includes(key)) {
          originUrl.searchParams.set(key, value);
        }
      }

      Option.map(sourceId, (id) => originUrl.searchParams.set("source_id", id));
      Option.map(sourceSecret, (secret) =>
        originUrl.searchParams.set("secret", secret)
      );

      originUrl.searchParams.set("table", params.table);
      if (shapeParams.where) {
        originUrl.searchParams.set("where", shapeParams.where);
      }

      // We use raw fetch instead of Effect's HttpClient because HttpClient eagerly
      // locks the response body's ReadableStream before we can proxy it as a stream.
      const response = yield* Effect.tryPromise({
        try: () => fetch(originUrl.toString()),
        catch: () => new HttpApiError.InternalServerError(),
      });

      // Upstream fetch may already be decompressed; stale encoding/length headers
      // can break browser decoding for streamed proxy responses.
      const responseHeaders = Headers.set(
        Headers.removeMany(
          Headers.fromInput(Object.fromEntries(response.headers.entries())),
          ["content-encoding", "content-length"]
        ),
        "vary",
        `Authorization, Cookie, ${WORKSPACE_ID_HEADER}`
      );

      return HttpServerResponse.stream(
        Stream.fromReadableStream({
          evaluate: () => response.body!,
          onError: (e) => new Cause.UnknownError(e),
        }),
        {
          status: response.status,
          headers: responseHeaders,
        }
      );
    });
