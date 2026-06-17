import {
  ScreenContextProvider,
  ScreenContextProviderUnavailableError,
} from "@recount/interface/screen-context";
import { Effect, Layer } from "effect";

const unavailable = new ScreenContextProviderUnavailableError({
  provider: "shadow",
  cause:
    "Shadow does not expose a stable local query API yet. Keep direct index access or a local bridge inside apps/desktop.",
});

export const ShadowScreenContextProviderLayer = Layer.succeed(
  ScreenContextProvider,
  {
    provider: "shadow",
    isAvailable: Effect.succeed(false),
    getCurrent: Effect.fail(unavailable),
    query: () => Effect.fail(unavailable),
    summarize: () => Effect.fail(unavailable),
  }
);
