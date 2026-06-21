import { Context, Effect, Layer, Schema } from "effect";

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

export interface ScreenContextObservation {
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
}

export interface ScreenContextQuery {
  readonly interval: {
    readonly startedAt: Date;
    readonly stoppedAt: Date;
  };
  readonly signals?: ReadonlyArray<ScreenContextSignal>;
  readonly limit?: number;
}

export interface ScreenContextSummary {
  readonly provider: ScreenContextProviderId;
  readonly interval: ScreenContextQuery["interval"];
  readonly summary: string;
  readonly topApps: ReadonlyArray<string>;
  readonly observations: ReadonlyArray<ScreenContextObservation>;
}

export type ScreenContextError =
  | ScreenContextProviderUnavailableError
  | ScreenContextQueryError;

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
    ReadonlyArray<ScreenContextObservation>,
    ScreenContextError
  >;
  readonly query: (
    query: ScreenContextQuery
  ) => Effect.Effect<
    ReadonlyArray<ScreenContextObservation>,
    ScreenContextError
  >;
  readonly summarize: (
    query: ScreenContextQuery
  ) => Effect.Effect<ScreenContextSummary, ScreenContextError>;
}

export class ScreenContextProvider extends Context.Service<
  ScreenContextProvider,
  ScreenContextProviderShape
>()("@recount/interface/ScreenContextProvider") {}

export type ScreenContextShape = Pick<
  ScreenContextProviderShape,
  "getCurrent" | "query" | "summarize"
>;

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

export const ScreenContextLayer = Layer.effect(
  ScreenContext,
  Effect.map(ScreenContextProvider, make)
);
