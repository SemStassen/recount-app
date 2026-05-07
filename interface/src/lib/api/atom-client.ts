import { RecountApi } from "@recount/core/http";
import { FetchHttpClient } from "effect/unstable/http";
import { AtomHttpApi } from "effect/unstable/reactivity";

import { env } from "../env";
import type { BackendHttpApiClient } from "./client";

export class BackendAtomHttpApiClient extends AtomHttpApi.Service<BackendHttpApiClient>()(
  "@recount/interface/BackendAtomHttpApiClient",
  {
    api: RecountApi,
    httpClient: FetchHttpClient.layer,
    baseUrl: env.VITE_BACKEND_URL,
  }
) {}
