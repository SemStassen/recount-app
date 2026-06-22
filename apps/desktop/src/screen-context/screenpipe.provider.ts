import {
  ScreenContextProvider,
  ScreenContextQueryError,
} from "@recount/interface/screen-context";
import type {
  ScreenContextObservation,
  ScreenContextQuery,
  ScreenContextSignal,
  ScreenContextSummary,
} from "@recount/interface/screen-context";
import { Effect, Layer } from "effect";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
} from "effect/unstable/http";

const screenpipeBaseUrl = "http://localhost:3030";

const screenpipeContentTypes: Partial<Record<ScreenContextSignal, string>> = {
  accessibility: "accessibility",
  audio: "audio",
  input: "input",
  memory: "memory",
  ocr: "ocr",
};

const toQueryError = (cause: unknown) =>
  new ScreenContextQueryError({ provider: "screenpipe", cause });

const parseDate = (value: unknown): Date => {
  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);

    if (!Number.isNaN(date.valueOf())) {
      return date;
    }
  }

  return new Date();
};

const getNestedString = (value: unknown, path: ReadonlyArray<string>) => {
  let current = value;

  for (const key of path) {
    if (typeof current !== "object" || current === null || !(key in current)) {
      return null;
    }

    current = (current as Record<string, unknown>)[key];
  }

  return typeof current === "string" && current.length > 0 ? current : null;
};

const inferSignal = (item: unknown): ScreenContextSignal => {
  const type = getNestedString(item, ["type"]);
  const contentType = getNestedString(item, ["content", "type"]);
  const source = getNestedString(item, ["content", "source"]);
  const value = (type ?? contentType ?? source ?? "ocr").toLowerCase();

  if (value.includes("accessibility")) {
    return "accessibility";
  }
  if (value.includes("audio")) {
    return "audio";
  }
  if (value.includes("input")) {
    return "input";
  }
  if (value.includes("memory")) {
    return "memory";
  }

  return "ocr";
};

const normalizeSearchItem = (item: unknown): ScreenContextObservation => ({
  provider: "screenpipe" as const,
  signal: inferSignal(item),
  capturedAt: parseDate(
    getNestedString(item, ["content", "timestamp"]) ??
      getNestedString(item, ["timestamp"])
  ),
  appName: getNestedString(item, ["content", "app_name"]),
  windowTitle: getNestedString(item, ["content", "window_name"]),
  title: getNestedString(item, ["content", "title"]),
  text:
    getNestedString(item, ["content", "text"]) ??
    getNestedString(item, ["content", "transcription"]) ??
    getNestedString(item, ["content", "content"]),
  url: null,
  frameId:
    getNestedString(item, ["content", "frame_id"]) ??
    getNestedString(item, ["frame_id"]),
  confidence: null,
  metadata: item,
});

const normalizeSearchResponse = (
  response: unknown
): ReadonlyArray<ScreenContextObservation> => {
  const data =
    typeof response === "object" && response !== null && "data" in response
      ? (response as { readonly data: unknown }).data
      : response;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeSearchItem);
};

const makeScreenpipeProvider = Effect.gen(function* () {
  const httpClient = (yield* HttpClient.HttpClient).pipe(
    HttpClient.mapRequest(HttpClientRequest.acceptJson),
    HttpClient.filterStatusOk,
    HttpClient.retryTransient({
      times: 3,
    })
  );

  const search = (query: ScreenContextQuery) => {
    const url = new URL("/search", screenpipeBaseUrl);
    const contentTypes = query.signals
      ?.map((signal) => screenpipeContentTypes[signal])
      .filter((signal): signal is string => typeof signal === "string");

    url.searchParams.set("content_type", contentTypes?.[0] ?? "all");
    url.searchParams.set("limit", String(query.limit ?? 50));
    url.searchParams.set("start_time", query.interval.startedAt.toISOString());
    url.searchParams.set("end_time", query.interval.stoppedAt.toISOString());

    return httpClient.get(url).pipe(
      Effect.flatMap((response) => response.json),
      Effect.map(normalizeSearchResponse),
      Effect.mapError(toQueryError)
    );
  };

  const summarize = (query: ScreenContextQuery) => {
    const url = new URL("/activity-summary", screenpipeBaseUrl);

    url.searchParams.set("start_time", query.interval.startedAt.toISOString());
    url.searchParams.set("end_time", query.interval.stoppedAt.toISOString());

    return httpClient.get(url).pipe(
      Effect.flatMap((response) => response.json),
      Effect.map((metadata): ScreenContextSummary => {
        const topApps = Array.isArray(
          (metadata as { readonly app_usage?: unknown })?.app_usage
        )
          ? (metadata as { readonly app_usage: Array<unknown> }).app_usage
              .map((item) => getNestedString(item, ["app_name"]))
              .filter((app): app is string => app !== null)
          : [];

        return {
          provider: "screenpipe" as const,
          interval: query.interval,
          summary: JSON.stringify(metadata),
          topApps,
          observations: [],
        };
      }),
      Effect.mapError(toQueryError)
    );
  };

  return ScreenContextProvider.of({
    provider: "screenpipe",
    isAvailable: Effect.match(
      httpClient.get(new URL("/health", screenpipeBaseUrl)),
      {
        onFailure: () => false,
        onSuccess: () => true,
      }
    ),
    getCurrent: search({
      interval: {
        startedAt: new Date(Date.now() - 5 * 60 * 1000),
        stoppedAt: new Date(),
      },
      limit: 25,
    }),
    query: search,
    summarize,
  });
});

const ScreenpipeHttpClientLayer = FetchHttpClient.layer.pipe(
  Layer.provide(Layer.succeed(HttpClient.TracerPropagationEnabled, false))
);

export const ScreenpipeScreenContextProviderLayer: Layer.Layer<ScreenContextProvider> =
  Layer.effect(ScreenContextProvider, makeScreenpipeProvider).pipe(
    Layer.provide(ScreenpipeHttpClientLayer)
  );
