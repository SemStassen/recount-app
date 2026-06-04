import {
  TrackedTimeRecord,
  TrackedTimeRepository,
} from "@recount/core/modules/time";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq, inArray, isNull } from "drizzle-orm";
import { Effect, Layer, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

export const TrackedTimeRepositoryLayer = Layer.effect(
  TrackedTimeRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertManyTimeEntries = SqlSchema.findAll({
      Request: Schema.Array(TrackedTimeRecord.insert),
      Result: TrackedTimeRecord,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.trackedTimeRecordsTable)
            .values([...data])
            .returning()
            .execute()
        ),
    });

    const updateTimeEntry = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: TrackedTimeRecord.fields.workspaceId,
        id: TrackedTimeRecord.fields.id,
        update: TrackedTimeRecord.update,
      }),
      Result: TrackedTimeRecord,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.trackedTimeRecordsTable)
            .set(update)
            .where(
              and(
                eq(schema.trackedTimeRecordsTable.workspaceId, workspaceId),
                eq(schema.trackedTimeRecordsTable.id, id)
              )
            )
            .returning()
            .execute()
        ),
    });

    const updateTimerRecordByWorkspaceMember = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TrackedTimeRecord.fields.workspaceId,
        workspaceMemberId: TrackedTimeRecord.fields.workspaceMemberId,
        update: TrackedTimeRecord.update,
      }),
      Result: TrackedTimeRecord,
      execute: ({ workspaceId, workspaceMemberId, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.trackedTimeRecordsTable)
            .set(update)
            .where(
              and(
                eq(schema.trackedTimeRecordsTable.workspaceId, workspaceId),
                eq(
                  schema.trackedTimeRecordsTable.workspaceMemberId,
                  workspaceMemberId
                ),
                isNull(schema.trackedTimeRecordsTable.stoppedAt)
              )
            )
            .returning()
            .execute()
        ),
    });

    const hardDeleteManyTimeEntries = SqlSchema.void({
      Request: Schema.Struct({
        workspaceId: TrackedTimeRecord.fields.workspaceId,
        ids: Schema.Array(TrackedTimeRecord.fields.id),
      }),
      execute: ({ workspaceId, ids }) =>
        db.drizzle((drizzle) =>
          drizzle
            .delete(schema.trackedTimeRecordsTable)
            .where(
              and(
                eq(schema.trackedTimeRecordsTable.workspaceId, workspaceId),
                inArray(schema.trackedTimeRecordsTable.id, ids)
              )
            )
            .execute()
        ),
    });

    const findTimeEntryById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TrackedTimeRecord.fields.workspaceId,
        id: TrackedTimeRecord.fields.id,
      }),
      Result: TrackedTimeRecord,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.trackedTimeRecordsTable)
            .where(
              and(
                eq(schema.trackedTimeRecordsTable.workspaceId, workspaceId),
                eq(schema.trackedTimeRecordsTable.id, id)
              )
            )
            .execute()
        ),
    });

    const findTimerRecordByWorkspaceMemberId = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TrackedTimeRecord.fields.workspaceId,
        workspaceMemberId: TrackedTimeRecord.fields.workspaceMemberId,
      }),
      Result: TrackedTimeRecord,
      execute: ({ workspaceId, workspaceMemberId }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.trackedTimeRecordsTable)
            .where(
              and(
                eq(schema.trackedTimeRecordsTable.workspaceId, workspaceId),
                eq(
                  schema.trackedTimeRecordsTable.workspaceMemberId,
                  workspaceMemberId
                ),
                isNull(schema.trackedTimeRecordsTable.stoppedAt)
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
