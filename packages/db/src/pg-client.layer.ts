import { PgClient } from "@effect/sql-pg";
import { Config } from "effect";

export const PgClientLayer = PgClient.layerConfig({
  url: Config.redacted("DATABASE_URL"),
});
