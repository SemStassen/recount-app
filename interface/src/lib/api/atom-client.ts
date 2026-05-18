import { RecountApi } from "@recount/core/http";
import { Layer } from "effect";
import { FetchHttpClient, HttpClient } from "effect/unstable/http";
import { AtomHttpApi } from "effect/unstable/reactivity";

import { env } from "../env";
import type { BackendHttpApiClient } from "./client";

const HttpClientLayer = FetchHttpClient.layer.pipe(
  Layer.provide(Layer.succeed(HttpClient.TracerPropagationEnabled, false))
);

export class BackendAtomHttpApiClient extends AtomHttpApi.Service<BackendHttpApiClient>()(
  "@recount/interface/BackendAtomHttpApiClient",
  {
    api: RecountApi,
    httpClient: HttpClientLayer,
    baseUrl: env.VITE_BACKEND_URL,
  }
) {}
