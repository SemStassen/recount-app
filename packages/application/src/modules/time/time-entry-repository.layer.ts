import {
  TimeEntryRecord,
  TimeEntryRepository,
} from "@recount/core/modules/time";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const TimeEntryRepositoryLayer = Layer.effect(
  TimeEntryRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertManyTimeEntries = SqlSchema.findAll({
      Request: Schema.Array(TimeEntryRecord.insert),
      Result: TimeEntryRecord,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.timeEntriesTable)
            .values([...data])
            .returning()
            .execute()
        ),
    });

    const updateTimeEntry = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: TimeEntryRecord.fields.workspaceId,
        id: TimeEntryRecord.fields.id,
        update: TimeEntryRecord.update,
      }),
      Result: TimeEntryRecord,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.timeEntriesTable)
            .set(update)
            .where(
              and(
                eq(schema.timeEntriesTable.workspaceId, workspaceId),
                eq(schema.timeEntriesTable.id, id)
              )
            )
            .returning()
            .execute()
        ),
    });

    const updateTimerRecordByWorkspaceMember = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TimeEntryRecord.fields.workspaceId,
        workspaceMemberId: TimeEntryRecord.fields.workspaceMemberId,
        update: TimeEntryRecord.update,
      }),
      Result: TimeEntryRecord,
      execute: ({ workspaceId, workspaceMemberId, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.timeEntriesTable)
            .set(update)
            .where(
              and(
                eq(schema.timeEntriesTable.workspaceId, workspaceId),
                eq(
                  schema.timeEntriesTable.workspaceMemberId,
                  workspaceMemberId
                ),
                isNull(schema.timeEntriesTable.stoppedAt)
              )
            )
            .returning()
            .execute()
        ),
    });

    const hardDeleteManyTimeEntries = SqlSchema.void({
      Request: Schema.Struct({
        workspaceId: TimeEntryRecord.fields.workspaceId,
        ids: Schema.Array(TimeEntryRecord.fields.id),
      }),
      execute: ({ workspaceId, ids }) =>
        db.drizzle((drizzle) =>
          drizzle
            .delete(schema.timeEntriesTable)
            .where(
              and(
                eq(schema.timeEntriesTable.workspaceId, workspaceId),
                inArray(schema.timeEntriesTable.id, ids)
              )
            )
            .execute()
        ),
    });

    const findTimeEntryById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TimeEntryRecord.fields.workspaceId,
        id: TimeEntryRecord.fields.id,
      }),
      Result: TimeEntryRecord,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.timeEntriesTable)
            .where(
              and(
                eq(schema.timeEntriesTable.workspaceId, workspaceId),
                eq(schema.timeEntriesTable.id, id)
              )
            )
            .execute()
        ),
    });

    const findTimerRecordByWorkspaceMemberId = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TimeEntryRecord.fields.workspaceId,
        workspaceMemberId: TimeEntryRecord.fields.workspaceMemberId,
      }),
      Result: TimeEntryRecord,
      execute: ({ workspaceId, workspaceMemberId }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.timeEntriesTable)
            .where(
              and(
                eq(schema.timeEntriesTable.workspaceId, workspaceId),
                eq(
                  schema.timeEntriesTable.workspaceMemberId,
                  workspaceMemberId
                ),
                isNull(schema.timeEntriesTable.stoppedAt)
              )
            )
            .execute()
        ),
    });

    return {
      insertMany: (data) =>
        insertManyTimeEntries(data).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      update: (params) =>
        updateTimeEntry(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      hardDeleteMany: (params) =>
        hardDeleteManyTimeEntries(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findById: (params) =>
        findTimeEntryById(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findTimerRecordByWorkspaceMember: (params) =>
        findTimerRecordByWorkspaceMemberId(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      updateTimerRecordByWorkspaceMember: (params) =>
        updateTimerRecordByWorkspaceMember(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
