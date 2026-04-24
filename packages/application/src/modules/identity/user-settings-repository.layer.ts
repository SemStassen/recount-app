import {
  UserSettings,
  UserSettingsRepository,
} from "@recount/core/modules/identity";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { eq } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const UserSettingsRepositoryLayer = Layer.effect(
  UserSettingsRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertUserSettings = SqlSchema.findOne({
      Request: UserSettings.insert,
      Result: UserSettings,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.userSettingsTable)
            .values(data)
            .returning()
            .execute()
        ),
    });

    const updateUserSettings = SqlSchema.findOne({
      Request: Schema.Struct({
        id: UserSettings.fields.id,
        update: UserSettings.update,
      }),
      Result: UserSettings,
      execute: ({ id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.userSettingsTable)
            .set(update)
            .where(eq(schema.userSettingsTable.id, id))
            .returning()
            .execute()
        ),
    });

    const findUserSettingsByUserId = SqlSchema.findOneOption({
      Request: UserSettings.fields.userId,
      Result: UserSettings,
      execute: (userId) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.userSettingsTable)
            .where(eq(schema.userSettingsTable.userId, userId))
            .execute()
        ),
    });

    return {
      insert: (data) =>
        insertUserSettings(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateUserSettings(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findByUserId: (userId) =>
        findUserSettingsByUserId(userId).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
