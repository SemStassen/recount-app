import type { Effect } from "effect";
import { Context } from "effect";

interface PlatformShape {
  getBearerToken: () => Effect.Effect<string>;
  storeBearerToken: () => Effect.Effect<string>;
}

export class Platform extends Context.Service<Platform, PlatformShape>()(
  "@recount/interface/lib/platform"
) {}
