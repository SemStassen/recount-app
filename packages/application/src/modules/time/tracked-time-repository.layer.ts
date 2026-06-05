import {
  Timer,
  TimeEntry,
  TimerAlreadyRunningError,
} from "@recount/core/modules/time";
import {
  timerFromTrackedTimeRow,
  timeEntryFromTrackedTimeRow,
  TrackedTimeRepository,
  TrackedTimeRow,
  trackedTimeRowFromTimeEntry,
  trackedTimeRowFromTimer,
  trackedTimeUpdateFromTimeEntryChanges,
} from "@recount/core/modules/time/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { Database, schema } from "@recount/db";
import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import { Effect, Layer, Option, Schema } from "effect";
import { SqlSchema } from "effect/unstable/sql";

const isCurrentTimerConflict = (error: unknown) =>
  typeof error === "object" &&
  error !== null &&
  "cause" in error &&
  typeof error.cause === "object" &&
  error.cause !== null &&
  "constraint" in error.cause &&
  error.cause.constraint === "time_entries_one_running_per_member_idx";

export const TrackedTimeRepositoryLayer = Layer.effect(
  TrackedTimeRepository,
  Effect.gen(function* () {
    const db = yield* Database;

    const insertManyTimeEntries = SqlSchema.findAll({
      Request: Schema.Array(TrackedTimeRow.insert),
      Result: TrackedTimeRow,
      execute: (data) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.trackedTimeRowsTable)
            .values([...data])
            .returning()
            .execute()
        ),
    });

    const updateTimeEntry = SqlSchema.findOne({
      Request: Schema.Struct({
        workspaceId: TrackedTimeRow.fields.workspaceId,
        id: TrackedTimeRow.fields.id,
        update: TrackedTimeRow.update,
      }),
      Result: TrackedTimeRow,
      execute: ({ workspaceId, id, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.trackedTimeRowsTable)
            .set(update)
            .where(
              and(
                eq(schema.trackedTimeRowsTable.workspaceId, workspaceId),
                eq(schema.trackedTimeRowsTable.id, id),
                isNotNull(schema.trackedTimeRowsTable.stoppedAt)
              )
            )
            .returning()
            .execute()
        ),
    });

    const insertCurrentTimer = SqlSchema.findOne({
      Request: TrackedTimeRow.insert,
      Result: TrackedTimeRow,
      execute: (timerRecord) =>
        db.drizzle((drizzle) =>
          drizzle
            .insert(schema.trackedTimeRowsTable)
            .values(timerRecord)
            .returning()
            .execute()
        ),
    });

    const updateCurrentTimer = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TrackedTimeRow.fields.workspaceId,
        workspaceMemberId: TrackedTimeRow.fields.workspaceMemberId,
        update: TrackedTimeRow.update,
      }),
      Result: TrackedTimeRow,
      execute: ({ workspaceId, workspaceMemberId, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.trackedTimeRowsTable)
            .set(update)
            .where(
              and(
                eq(schema.trackedTimeRowsTable.workspaceId, workspaceId),
                eq(
                  schema.trackedTimeRowsTable.workspaceMemberId,
                  workspaceMemberId
                ),
                isNull(schema.trackedTimeRowsTable.stoppedAt)
              )
            )
            .returning()
            .execute()
        ),
    });

    const completeCurrentTimer = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TrackedTimeRow.fields.workspaceId,
        workspaceMemberId: TrackedTimeRow.fields.workspaceMemberId,
        update: TrackedTimeRow.update,
      }),
      Result: TrackedTimeRow,
      execute: ({ workspaceId, workspaceMemberId, update }) =>
        db.drizzle((drizzle) =>
          drizzle
            .update(schema.trackedTimeRowsTable)
            .set(update)
            .where(
              and(
                eq(schema.trackedTimeRowsTable.workspaceId, workspaceId),
                eq(
                  schema.trackedTimeRowsTable.workspaceMemberId,
                  workspaceMemberId
                ),
                isNull(schema.trackedTimeRowsTable.stoppedAt)
              )
            )
            .returning()
            .execute()
        ),
    });

    const hardDeleteManyTimeEntries = SqlSchema.void({
      Request: Schema.Struct({
        workspaceId: TimeEntry.fields.workspaceId,
        ids: Schema.Array(TimeEntry.fields.id),
      }),
      execute: ({ workspaceId, ids }) =>
        db.drizzle((drizzle) =>
          drizzle
            .delete(schema.trackedTimeRowsTable)
            .where(
              and(
                eq(schema.trackedTimeRowsTable.workspaceId, workspaceId),
                inArray(schema.trackedTimeRowsTable.id, ids),
                isNotNull(schema.trackedTimeRowsTable.stoppedAt)
              )
            )
            .execute()
        ),
    });

    const findTimeEntryById = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: TimeEntry.fields.workspaceId,
        id: TimeEntry.fields.id,
      }),
      Result: TrackedTimeRow,
      execute: ({ workspaceId, id }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.trackedTimeRowsTable)
            .where(
              and(
                eq(schema.trackedTimeRowsTable.workspaceId, workspaceId),
                eq(schema.trackedTimeRowsTable.id, id),
                isNotNull(schema.trackedTimeRowsTable.stoppedAt)
              )
            )
            .execute()
        ),
    });

    const findCurrentTimer = SqlSchema.findOneOption({
      Request: Schema.Struct({
        workspaceId: Timer.fields.workspaceId,
        workspaceMemberId: Timer.fields.workspaceMemberId,
      }),
      Result: TrackedTimeRow,
      execute: ({ workspaceId, workspaceMemberId }) =>
        db.drizzle((drizzle) =>
          drizzle
            .select()
            .from(schema.trackedTimeRowsTable)
            .where(
              and(
                eq(schema.trackedTimeRowsTable.workspaceId, workspaceId),
                eq(
                  schema.trackedTimeRowsTable.workspaceMemberId,
                  workspaceMemberId
                ),
                isNull(schema.trackedTimeRowsTable.stoppedAt)
              )
            )
            .execute()
        ),
    });

    return {
      insertTimeEntries: (timeEntries) =>
        insertManyTimeEntries(
          timeEntries.map(trackedTimeRowFromTimeEntry)
        ).pipe(
          Effect.map((trackedTimeRows) =>
            trackedTimeRows.map(timeEntryFromTrackedTimeRow)
          ),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      updateTimeEntry: (params) =>
        updateTimeEntry({
          id: params.id,
          workspaceId: params.workspaceId,
          update: trackedTimeUpdateFromTimeEntryChanges(params.data),
        }).pipe(
          Effect.map(timeEntryFromTrackedTimeRow),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      hardDeleteMany: (params) =>
        hardDeleteManyTimeEntries(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findTimeEntry: (params) =>
        findTimeEntryById(params).pipe(
          Effect.map(Option.map(timeEntryFromTrackedTimeRow)),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findCurrentTimer: (params) =>
        findCurrentTimer(params).pipe(
          Effect.map(Option.map(timerFromTrackedTimeRow)),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      insertCurrentTimer: (timer) =>
        insertCurrentTimer(trackedTimeRowFromTimer(timer)).pipe(
          Effect.map(timerFromTrackedTimeRow),
          Effect.mapError((e) =>
            isCurrentTimerConflict(e)
              ? new TimerAlreadyRunningError({
                  workspaceId: timer.workspaceId,
                  workspaceMemberId: timer.workspaceMemberId,
                })
              : new RepositoryError({ cause: e })
          )
        ),
      updateCurrentTimer: (params) =>
        updateCurrentTimer({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
          update: params.data,
        }).pipe(
          Effect.map(Option.map(timerFromTrackedTimeRow)),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      completeCurrentTimer: (params) =>
        completeCurrentTimer({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
          update: trackedTimeUpdateFromTimeEntryChanges({
            stoppedAt: params.timeEntry.stoppedAt,
          }),
        }).pipe(
          Effect.map(Option.map(timeEntryFromTrackedTimeRow)),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
