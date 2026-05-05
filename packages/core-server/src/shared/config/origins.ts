import { Effect, Schema } from "effect";

export class InvalidFrontendOriginsError extends Schema.TaggedErrorClass<InvalidFrontendOriginsError>()(
  "InvalidFrontendOriginsError",
  { message: Schema.String }
) {}

// Matches patterns like https://*.example.com or https://preview*.example.com:3000
const wildcardPatternRegex =
  /^(https?):\/\/([A-Za-z0-9-]*)\*\.([A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*)(?::(\d+))?$/i;

const escapeRegex = (value: string) =>
  value.replace(/[|\\{}()[\]^$+?.]/g, "\\$&");

// ------------------------------------------------------------------
// Matching
// ------------------------------------------------------------------

export const matchesAllowedOrigin = (
  origin: string,
  patterns: ReadonlyArray<string>
) =>
  patterns.some((pattern) => {
    if (!pattern.includes("*")) return origin === pattern;

    const match = pattern.match(wildcardPatternRegex);
    if (!match) return false;

    const [, protocol, prefix, hostname, port] = match;
    const regex = new RegExp(
      `^${protocol}:\\/\\/${escapeRegex(prefix)}[^.]+\\.${escapeRegex(hostname)}${port ? `:${port}` : ""}$`,
      "i"
    );

    return regex.test(origin);
  });

// ------------------------------------------------------------------
// Parsing & validation
// ------------------------------------------------------------------

export const parseOrigins = (rawOrigins: string) =>
  Effect.gen(function* () {
    const origins = [
      ...new Set(
        rawOrigins
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      ),
    ];

    if (origins.length === 0) {
      return yield* new InvalidFrontendOriginsError({
        message: "FRONTEND_ORIGINS must include at least one origin",
      });
    }

    return yield* Effect.forEach(origins, (raw) =>
      Effect.gen(function* () {
        if (raw.includes("*")) {
          const match = raw.match(wildcardPatternRegex);
          if (!match) {
            return yield* new InvalidFrontendOriginsError({
              message: `Invalid wildcard origin pattern: ${raw}. Expected format: https://*.example.com`,
            });
          }

          const [, protocol, prefix, hostname, port] = match;
          return `${protocol}://${prefix}*.${hostname}${port ? `:${port}` : ""}`;
        }

        const url = yield* Effect.try({
          try: () => new URL(raw),
          catch: () => null,
        });

        if (!url) {
          return yield* new InvalidFrontendOriginsError({
            message: `Invalid origin: ${raw}`,
          });
        }

        if (!["http:", "https:", "tauri:"].includes(url.protocol)) {
          return yield* new InvalidFrontendOriginsError({
            message: `Origin must use http, https, or tauri: ${raw}`,
          });
        }

        if (!url.host) {
          return yield* new InvalidFrontendOriginsError({
            message: `Origin must include a host: ${raw}`,
          });
        }

        if (url.username || url.password) {
          return yield* new InvalidFrontendOriginsError({
            message: `Origin must not include credentials: ${raw}`,
          });
        }

        // Normalize: strip trailing slash, ignore any path/query/hash the user accidentally included
        return `${url.protocol}//${url.host}`;
      })
    );
  });
