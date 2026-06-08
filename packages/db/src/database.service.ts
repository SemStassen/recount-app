import * as PgDrizzle from "drizzle-orm/effect-postgres";
import { Schema, Context } from "effect";
import type { Effect } from "effect";
import type { Pool } from "pg";

export class DatabaseError extends Schema.TaggedErrorClass<DatabaseError>()(
  "db/DatabaseError",
  {
    cause: Schema.Unknown,
  }
) {}

export type DrizzleDb = PgDrizzle.EffectPgDatabase;

export type TransactionDb = Parameters<
  Parameters<DrizzleDb["transaction"]>[0]
>[0];

export type ActiveConnection = DrizzleDb | TransactionDb;

export interface DatabaseShape {
  /**
   * Integration-only escape hatch to the root Drizzle client.
   *
   * This bypasses fiber-local transaction context. Prefer `drizzle(...)` for
   * application code that should participate in `withTransaction(...)`.
   * Use this only for integrations that must talk directly to the root driver,
   * such as Better Auth.
   */
  readonly unsafeDrizzle: DrizzleDb;
  /**
   * Integration-only escape hatch to a Promise-based Drizzle client.
   *
   * This shares the same underlying pg pool as the Effect driver, but does not
   * participate in fiber-local transaction context. Use only for integrations
   * that require Promise-returning Drizzle queries, such as Better Auth.
   */
  readonly unsafePgPool: Pool;
  /**
   * Preferred query entrypoint for application code.
   *
   * Resolves the active Drizzle connection for the current fiber, using either
   * the root client or the innermost active transaction.
   *
   */
  readonly drizzle: <A, E, R = never>(
    f: (drizzle: ActiveConnection) => Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | DatabaseError, R>;
  /**
   * Run operations in a transaction.
   *
   * This swaps the active connection for the current fiber. Repositories may
   * safely capture `Database` once and still participate in nested
   * `withTransaction(...)` calls through `drizzle(...)`.
   *
   * **Error Handling:**
   * - If the effect fails with any error, the transaction is rolled back
   * - To handle errors and continue, catch them within the transaction
   * - To explicitly rollback, let an error propagate (or fail with DatabaseError)
   *
   * **Nested Transactions (Checkpoints):**
   * Nested transactions are automatically handled via savepoints.
   * You can create checkpoints by nesting `withTransaction` calls:
   *
   * @example
   * ```ts
   * // Handle errors without rolling back
   * yield* db.withTransaction(
   *   Effect.gen(function* () {
   *     yield* doSomething();
   *
   *     // Catch and handle errors, transaction continues
   *     yield* doMore().pipe(
   *       Effect.catchAll((error) => {
   *         // Handle error, transaction still commits
   *         return Effect.succeed(defaultValue);
   *       })
   *     );
   *   })
   * );
   *
   * // Create checkpoint with nested transaction
   * yield* db.withTransaction(
   *   Effect.gen(function* () {
   *     yield* doSomething();
   *
   *     // Nested transaction = checkpoint
   *     yield* db.withTransaction(
   *       Effect.gen(function* () {
   *         yield* doMore();
   *         // If this fails, rolls back to checkpoint only
   *       })
   *     );
   *   })
   * );
   * ```
   */
  readonly withTransaction: <A, E, R>(
    effect: Effect.Effect<A, E, R>
  ) => Effect.Effect<A, E | DatabaseError, Exclude<R, Database>>;
}

export class Database extends Context.Service<Database, DatabaseShape>()(
  "@recount/db/Database"
) {}
