import { PgClient } from "@effect/sql-pg";
import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Config, Context, Effect, Layer, Redacted } from "effect";
import { Pool } from "pg";

import { Database } from "./database.service";
import type {
  ActiveConnection,
  DatabaseError,
  DatabaseShape,
} from "./database.service";

class PgPool extends Context.Service<PgPool, Pool>()("@recount/db/PgPool") {}

const PgPoolLayer = Layer.effect(
  PgPool,
  Effect.gen(function* () {
    const databaseUrl = yield* Config.redacted("DATABASE_URL");

    return yield* Effect.acquireRelease(
      Effect.sync(
        () =>
          new Pool({
            connectionString: Redacted.value(databaseUrl),
          })
      ),
      (pool) => Effect.promise(() => pool.end())
    );
  })
);

const PgClientLayer = Layer.unwrap(
  Effect.gen(function* () {
    const pool = yield* PgPool;

    return PgClient.layerFrom(
      PgClient.fromPool({
        acquire: Effect.succeed(pool),
      })
    );
  })
);

export const DatabaseLayer = Layer.effect(
  Database,
  Effect.gen(function* () {
    const pool = yield* PgPool;
    const drizzle = yield* PgDrizzle.make();

    const ActiveConnection = Context.Reference<ActiveConnection>(
      "@recount/db/ActiveConnection",
      {
        defaultValue: () => drizzle,
      }
    );

    const database: DatabaseShape = {
      unsafeDrizzle: drizzle,
      unsafePgPool: pool,
      drizzle: <A, E, R = never>(
        func: (drizzle: ActiveConnection) => Effect.Effect<A, E, R>
      ): Effect.Effect<A, E | DatabaseError, R> =>
        Effect.gen(function* () {
          const activeConnection = yield* ActiveConnection;

          return yield* func(activeConnection);
        }),
      withTransaction: <A, E, R>(effect: Effect.Effect<A, E, R>) =>
        Effect.gen(function* () {
          const activeConnection = yield* ActiveConnection;

          return yield* activeConnection.transaction((transaction) =>
            Effect.provideService(effect, ActiveConnection, transaction)
          );
        }) as Effect.Effect<A, E | DatabaseError, Exclude<R, Database>>,
    };

    return database;
  })
).pipe(
  Layer.provide(PgDrizzle.DefaultServices),
  Layer.provide(PgClientLayer),
  Layer.provide(PgPoolLayer)
);
