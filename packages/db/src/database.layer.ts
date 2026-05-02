import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Context, Effect, Layer } from "effect";

import { PgClientLayer } from "./pg-client.layer";
import { Database, DatabaseError } from "./database.service";
import type { ActiveConnection, DatabaseShape } from "./database.service";

export const DatabaseLayer = Layer.effect(
  Database,
  Effect.gen(function* () {
    const drizzle = yield* PgDrizzle.make();

    const ActiveConnection = Context.Reference<ActiveConnection>(
      "@recount/db/ActiveConnection",
      {
        defaultValue: () => drizzle,
      }
    );

    const database: DatabaseShape = {
      unsafeDrizzle: drizzle,
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
).pipe(Layer.provide(PgDrizzle.DefaultServices), Layer.provide(PgClientLayer));
