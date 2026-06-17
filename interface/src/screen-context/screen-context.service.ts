import { Context, Effect, Schema } from "effect";

export const ScreenContextProviderId = Schema.Literals([
  "screenpipe",
  "shadow",
  "none",
]);
export type ScreenContextProviderId = typeof ScreenContextProviderId.Type;

export type ScreenContextSignal =
  | "accessibility"
  | "ocr"
  | "audio"
  | "input"
  | "window"
  | "episode"
  | "memory";

export class ScreenContextProviderUnavailableError extends Schema.TaggedErrorClass<ScreenContextProviderUnavailableError>()(
  "screen-context/ScreenContextProviderUnavailableError",
  {
    provider: ScreenContextProviderId,
    cause: Schema.optional(Schema.Unknown),
  }
) {}

export class ScreenContextQueryError extends Schema.TaggedErrorClass<ScreenContextQueryError>()(
  "screen-context/ScreenContextQueryError",
  {
    provider: ScreenContextProviderId,
    cause: Schema.optional(Schema.Unknown),
  }
) {}

export interface ScreenContextProviderShape {
  readonly provider: ScreenContextProviderId;
  readonly isAvailable: Effect.Effect<boolean>;
  readonly getCurrent: Effect.Effect<
    ReadonlyArray<{
      readonly provider: ScreenContextProviderId;
      readonly signal: ScreenContextSignal;
      readonly capturedAt: Date;
      readonly appName: string | null;
      readonly windowTitle: string | null;
      readonly title: string | null;
      readonly text: string | null;
      readonly url: string | null;
      readonly frameId: string | null;
      readonly confidence: number | null;
      readonly metadata: unknown;
    }>,
    ScreenContextProviderUnavailableError | ScreenContextQueryError
  >;
  readonly query: (query: {
    readonly interval: {
      readonly startedAt: Date;
      readonly stoppedAt: Date;
    };
    readonly signals?: ReadonlyArray<ScreenContextSignal>;
    readonly limit?: number;
  }) => Effect.Effect<
    ReadonlyArray<{
      readonly provider: ScreenContextProviderId;
      readonly signal: ScreenContextSignal;
      readonly capturedAt: Date;
      readonly appName: string | null;
      readonly windowTitle: string | null;
      readonly title: string | null;
      readonly text: string | null;
      readonly url: string | null;
      readonly frameId: string | null;
      readonly confidence: number | null;
      readonly metadata: unknown;
    }>,
    ScreenContextProviderUnavailableError | ScreenContextQueryError
  >;
  readonly summarize: (query: {
    readonly interval: {
      readonly startedAt: Date;
      readonly stoppedAt: Date;
    };
    readonly signals?: ReadonlyArray<ScreenContextSignal>;
    readonly limit?: number;
  }) => Effect.Effect<
    {
      readonly provider: ScreenContextProviderId;
      readonly interval: {
        readonly startedAt: Date;
        readonly stoppedAt: Date;
      };
      readonly summary: string;
      readonly topApps: ReadonlyArray<string>;
      readonly observations: ReadonlyArray<{
        readonly provider: ScreenContextProviderId;
        readonly signal: ScreenContextSignal;
        readonly capturedAt: Date;
        readonly appName: string | null;
        readonly windowTitle: string | null;
        readonly title: string | null;
        readonly text: string | null;
        readonly url: string | null;
        readonly frameId: string | null;
        readonly confidence: number | null;
        readonly metadata: unknown;
      }>;
    },
    ScreenContextProviderUnavailableError | ScreenContextQueryError
  >;
}

export class ScreenContextProvider extends Context.Service<
  ScreenContextProvider,
  ScreenContextProviderShape
>()("@recount/interface/ScreenContextProvider") {}

export interface ScreenContextShape {
  readonly getCurrent: Effect.Effect<
    ReadonlyArray<{
      readonly provider: ScreenContextProviderId;
      readonly signal: ScreenContextSignal;
      readonly capturedAt: Date;
      readonly appName: string | null;
      readonly windowTitle: string | null;
      readonly title: string | null;
      readonly text: string | null;
      readonly url: string | null;
      readonly frameId: string | null;
      readonly confidence: number | null;
      readonly metadata: unknown;
    }>,
    ScreenContextProviderUnavailableError | ScreenContextQueryError
  >;
  readonly query: (query: {
    readonly interval: {
      readonly startedAt: Date;
      readonly stoppedAt: Date;
    };
    readonly signals?: ReadonlyArray<ScreenContextSignal>;
    readonly limit?: number;
  }) => Effect.Effect<
    ReadonlyArray<{
      readonly provider: ScreenContextProviderId;
      readonly signal: ScreenContextSignal;
      readonly capturedAt: Date;
      readonly appName: string | null;
      readonly windowTitle: string | null;
      readonly title: string | null;
      readonly text: string | null;
      readonly url: string | null;
      readonly frameId: string | null;
      readonly confidence: number | null;
      readonly metadata: unknown;
    }>,
    ScreenContextProviderUnavailableError | ScreenContextQueryError
  >;
  readonly summarize: (query: {
    readonly interval: {
      readonly startedAt: Date;
      readonly stoppedAt: Date;
    };
    readonly signals?: ReadonlyArray<ScreenContextSignal>;
    readonly limit?: number;
  }) => Effect.Effect<
    {
      readonly provider: ScreenContextProviderId;
      readonly interval: {
        readonly startedAt: Date;
        readonly stoppedAt: Date;
      };
      readonly summary: string;
      readonly topApps: ReadonlyArray<string>;
      readonly observations: ReadonlyArray<{
        readonly provider: ScreenContextProviderId;
        readonly signal: ScreenContextSignal;
        readonly capturedAt: Date;
        readonly appName: string | null;
        readonly windowTitle: string | null;
        readonly title: string | null;
        readonly text: string | null;
        readonly url: string | null;
        readonly frameId: string | null;
        readonly confidence: number | null;
        readonly metadata: unknown;
      }>;
    },
    ScreenContextProviderUnavailableError | ScreenContextQueryError
  >;
}

const make = (provider: ScreenContextProviderShape): ScreenContextShape => ({
  getCurrent: provider.getCurrent,
  query: provider.query,
  summarize: provider.summarize,
});

export class ScreenContext extends Context.Service<
  ScreenContext,
  ScreenContextShape
>()("@recount/interface/ScreenContext", {
  make: Effect.map(ScreenContextProvider, make),
}) {}
