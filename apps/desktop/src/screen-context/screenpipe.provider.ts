import {
  ScreenContextProvider,
  ScreenContextQueryError,
} from "@recount/interface/screen-context";
import type {
  ScreenContextProviderShape,
  ScreenContextSignal,
} from "@recount/interface/screen-context";
import { fetch } from "@tauri-apps/plugin-http";
import { Effect, Layer } from "effect";

const screenpipeBaseUrl = "http://localhost:3030";

type ScreenContextQuery = Parameters<ScreenContextProviderShape["query"]>[0];

const screenpipeContentTypes: Partial<Record<ScreenContextSignal, string>> = {
  accessibility: "accessibility",
  audio: "audio",
  input: "input",
  memory: "memory",
  ocr: "ocr",
};

const fetchJson = (url: URL) =>
  Effect.tryPromise({
    try: async () => {
      const response = await fetch(url.toString());

      if (!response.ok) {
        throw new Error(`screenpipe request failed with ${response.status}`);
      }

      return response.json() as Promise<unknown>;
    },
    catch: (cause) =>
      new ScreenContextQueryError({ provider: "screenpipe", cause }),
  });

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

const normalizeSearchItem = (item: unknown) => ({
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
) => {
  const data =
    typeof response === "object" && response !== null && "data" in response
      ? (response as { readonly data: unknown }).data
      : response;

  if (!Array.isArray(data)) {
    return [];
  }

  return data.map(normalizeSearchItem);
};

const search = (query: ScreenContextQuery) => {
  const url = new URL("/search", screenpipeBaseUrl);
  const contentTypes = query.signals
    ?.map((signal) => screenpipeContentTypes[signal])
    .filter((signal): signal is string => typeof signal === "string");

  url.searchParams.set("content_type", contentTypes?.[0] ?? "all");
  url.searchParams.set("limit", String(query.limit ?? 50));
  url.searchParams.set("start_time", query.interval.startedAt.toISOString());
  url.searchParams.set("end_time", query.interval.stoppedAt.toISOString());

  return Effect.map(fetchJson(url), normalizeSearchResponse);
};

const summarize = (query: ScreenContextQuery) => {
  const url = new URL("/activity-summary", screenpipeBaseUrl);

  url.searchParams.set("start_time", query.interval.startedAt.toISOString());
  url.searchParams.set("end_time", query.interval.stoppedAt.toISOString());

  return Effect.map(fetchJson(url), (metadata) => {
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
  });
};

export const ScreenpipeScreenContextProviderLayer = Layer.succeed(
  ScreenContextProvider,
  {
    provider: "screenpipe",
    isAvailable: Effect.match(
      fetchJson(new URL("/health", screenpipeBaseUrl)),
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
  }
);
