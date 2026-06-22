import { Option, Result, Schema } from "effect";

import { TimerId, TimeEntryId } from "#shared/schemas/index";

import { Timer, TimeEntry } from "../domain/tracked-time.entity";
import { TrackedTimeRow } from "./tracked-time-row";

export class TrackedTimeRowStateMismatchError extends Schema.TaggedErrorClass<TrackedTimeRowStateMismatchError>()(
  "time/TrackedTimeRowStateMismatchError",
  {
    trackedTimeId: TrackedTimeRow.fields.id,
    expectedState: Schema.Union([
      Schema.Literal("timer"),
      Schema.Literal("time-entry"),
    ]),
  }
) {}

export const isRunningTrackedTimeRow = (row: TrackedTimeRow) =>
  Option.isNone(row.stoppedAt);

export const timeEntryFromTrackedTimeRow = (
  row: TrackedTimeRow
): Result.Result<TimeEntry, TrackedTimeRowStateMismatchError> => {
  if (Option.isNone(row.stoppedAt)) {
    return Result.fail(
      new TrackedTimeRowStateMismatchError({
        trackedTimeId: row.id,
        expectedState: "time-entry",
      })
    );
  }

  return Result.succeed(
    TimeEntry.make({
      id: TimeEntryId.make(row.id),
      workspaceId: row.workspaceId,
      workspaceMemberId: row.workspaceMemberId,
      projectId: row.projectId,
      taskId: row.taskId,
      startedAt: row.startedAt,
      stoppedAt: row.stoppedAt.value,
      notes: row.notes,
    })
  );
};

export const timerFromTrackedTimeRow = (
  row: TrackedTimeRow
): Result.Result<Timer, TrackedTimeRowStateMismatchError> => {
  if (Option.isSome(row.stoppedAt)) {
    return Result.fail(
      new TrackedTimeRowStateMismatchError({
        trackedTimeId: row.id,
        expectedState: "timer",
      })
    );
  }

  return Result.succeed(
    Timer.make({
      id: TimerId.make(row.id),
      workspaceId: row.workspaceId,
      workspaceMemberId: row.workspaceMemberId,
      projectId: row.projectId,
      taskId: row.taskId,
      startedAt: row.startedAt,
      notes: row.notes,
    })
  );
};

export const trackedTimeStateFromTrackedTimeRow = (
  row: TrackedTimeRow
): Result.Result<Timer | TimeEntry, TrackedTimeRowStateMismatchError> =>
  isRunningTrackedTimeRow(row)
    ? timerFromTrackedTimeRow(row)
    : timeEntryFromTrackedTimeRow(row);

export const trackedTimeUpdateFromTimeEntryChanges = (
  changes: typeof TimeEntry.jsonUpdate.Type
): typeof TrackedTimeRow.update.Type => {
  const { stoppedAt, ...otherChanges } = changes;

  return stoppedAt === undefined
    ? otherChanges
    : {
        ...otherChanges,
        stoppedAt: Option.some(stoppedAt),
      };
};

export const trackedTimeRowFromTimeEntry = (timeEntry: TimeEntry) =>
  TrackedTimeRow.make({
    ...timeEntry,
    stoppedAt: Option.some(timeEntry.stoppedAt),
  });

export const trackedTimeRowFromTimer = (timer: Timer) =>
  TrackedTimeRow.make({
    ...timer,
    stoppedAt: Option.none(),
  });
