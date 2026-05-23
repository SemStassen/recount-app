import { RecountApi } from "@recount/core/http";
import { Effect, Layer, Context } from "effect";
import { HttpClient, HttpClientError } from "effect/unstable/http";
import { HttpApiClient } from "effect/unstable/httpapi";

import { setAuthHeaders } from "../auth";
import { env } from "../env";

export class BackendHttpApiClient extends Context.Service<BackendHttpApiClient>()(
  "@recount/interface/BackendHttpApiClient",
  {
    make: Effect.succeed(
      HttpApiClient.make(RecountApi, {
        baseUrl: env.VITE_BACKEND_URL,
        transformClient: (client) =>
          client.pipe(
            HttpClient.mapRequest(setAuthHeaders),
            HttpClient.retry({
              times: 3,
              // Only retry server errors (5xx), not client errors (4xx) like 401/403
              while: (error) => {
                if (HttpClientError.isHttpClientError(error)) {
                  const status = error.response?.status;
                  return (
                    status === undefined || (status >= 500 && status < 600)
                  );
                }
                return false;
              },
            })
          ),
      })
    ),
  }
) {
  static readonly layer = Layer.effect(this, this.make);
}
