import { Effect, Layer } from "effect";

import {
  ScreenContextProvider,
  ScreenContextProviderUnavailableError,
} from "./screen-context.service";

const unavailable = new ScreenContextProviderUnavailableError({
  provider: "none",
  cause: "Screen context is not available on this platform.",
});

export const NoopScreenContextProviderLayer = Layer.succeed(
  ScreenContextProvider,
  {
    provider: "none",
    isAvailable: Effect.succeed(false),
    getCurrent: Effect.fail(unavailable),
    query: () => Effect.fail(unavailable),
    summarize: () => Effect.fail(unavailable),
  }
);
