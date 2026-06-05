import {
  CurrentTimerConflictError,
  Timer,
  timerFromTrackedTime,
  TimeEntry,
  timeEntryFromTrackedTime,
  TrackedTime,
  trackedTimeFromTimeEntry,
  trackedTimeFromTimer,
  TrackedTimeRepository,
  trackedTimeUpdateFromTimeEntryChanges,
  trackedTimeUpdateFromTimerChanges,
} from "@recount/core/modules/time";
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
      Request: Schema.Array(TrackedTime.insert),
      Result: TrackedTime,
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
        workspaceId: TrackedTime.fields.workspaceId,
        id: TrackedTime.fields.id,
        update: TrackedTime.update,
      }),
      Result: TrackedTime,
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
      Request: TrackedTime.insert,
      Result: TrackedTime,
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
        workspaceId: TrackedTime.fields.workspaceId,
        workspaceMemberId: TrackedTime.fields.workspaceMemberId,
        update: TrackedTime.update,
      }),
      Result: TrackedTime,
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
        workspaceId: TrackedTime.fields.workspaceId,
        workspaceMemberId: TrackedTime.fields.workspaceMemberId,
        update: TrackedTime.update,
      }),
      Result: TrackedTime,
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
      Result: TrackedTime,
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
      Result: TrackedTime,
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
        insertManyTimeEntries(timeEntries.map(trackedTimeFromTimeEntry)).pipe(
          Effect.map((trackedTimes) =>
            trackedTimes.map(timeEntryFromTrackedTime)
          ),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      updateTimeEntry: (params) =>
        updateTimeEntry({
          id: params.id,
          workspaceId: params.workspaceId,
          update: trackedTimeUpdateFromTimeEntryChanges(params.data),
        }).pipe(
          Effect.map(timeEntryFromTrackedTime),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      hardDeleteMany: (params) =>
        hardDeleteManyTimeEntries(params).pipe(
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findTimeEntry: (params) =>
        findTimeEntryById(params).pipe(
          Effect.map(Option.map(timeEntryFromTrackedTime)),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      findCurrentTimer: (params) =>
        findCurrentTimer(params).pipe(
          Effect.map(Option.map(timerFromTrackedTime)),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
      insertCurrentTimer: (timer) =>
        insertCurrentTimer(trackedTimeFromTimer(timer)).pipe(
          Effect.map(timerFromTrackedTime),
          Effect.mapError((e) =>
            isCurrentTimerConflict(e)
              ? new CurrentTimerConflictError({
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
          update: trackedTimeUpdateFromTimerChanges(params.data),
        }).pipe(
          Effect.map(Option.map(timerFromTrackedTime)),
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
          Effect.map(Option.map(timeEntryFromTrackedTime)),
          Effect.mapError((e) => new RepositoryError({ cause: e }))
        ),
    };
  })
);
