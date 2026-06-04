import { DateTime, Option, Result } from "effect";

import { TimeEntryId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Timer, TimeEntry } from "./time-entry.entity";
import { TimeEntryStoppedAtBeforeStartedAtError } from "./time-entry.errors";

const ensureValidDateRange = (
  startedAt: DateTime.Utc,
  stoppedAt: DateTime.Utc
): Result.Result<void, TimeEntryStoppedAtBeforeStartedAtError> =>
  DateTime.isGreaterThanOrEqualTo(stoppedAt, startedAt)
    ? Result.succeed(undefined)
    : Result.fail(new TimeEntryStoppedAtBeforeStartedAtError());

export const createTimeEntry = (params: {
  workspaceId: TimeEntry["workspaceId"];
  workspaceMemberId: TimeEntry["workspaceMemberId"];
  data: typeof TimeEntry.jsonCreate.Type;
  now: DateTime.Utc;
}): Result.Result<TimeEntry, TimeEntryStoppedAtBeforeStartedAtError> =>
  Result.gen(function* () {
    const { id, startedAt, ...rest } = params.data;

    const createdTimeEntry = TimeEntry.make({
      id: Option.getOrElse(id, () => TimeEntryId.make(generateUUID())),
      workspaceId: params.workspaceId,
      workspaceMemberId: params.workspaceMemberId,
      startedAt: startedAt ?? params.now,
      taskId: Option.none(),
      notes: Option.none(),
      ...rest,
    });

    yield* ensureValidDateRange(
      createdTimeEntry.startedAt,
      createdTimeEntry.stoppedAt
    );

    return createdTimeEntry;
  });

export const startTimer = (params: {
  workspaceId: Timer["workspaceId"];
  workspaceMemberId: Timer["workspaceMemberId"];
  data: typeof Timer.jsonCreate.Type;
  now: DateTime.Utc;
}): Result.Result<Timer, never> =>
  Result.succeed(
    (() => {
      const { id, ...data } = params.data;

      return Timer.make({
        taskId: Option.none(),
        notes: Option.none(),
        ...data,
        id: Option.getOrElse(id, () => TimeEntryId.make(generateUUID())),
        workspaceId: params.workspaceId,
        workspaceMemberId: params.workspaceMemberId,
        startedAt: params.now,
      });
    })()
  );

export const updateTimeEntry = (params: {
  timeEntry: TimeEntry;
  data: typeof TimeEntry.jsonUpdate.Type;
}): Result.Result<
  { entity: TimeEntry; changes: typeof TimeEntry.jsonUpdate.Type },
  TimeEntryStoppedAtBeforeStartedAtError
> =>
  Result.gen(function* () {
    const updatedTimeEntry = TimeEntry.make({
      ...params.timeEntry,
      ...params.data,
    });

    yield* ensureValidDateRange(
      updatedTimeEntry.startedAt,
      updatedTimeEntry.stoppedAt
    );

    return {
      entity: updatedTimeEntry,
      changes: params.data,
    };
  });

export const updateTimer = (params: {
  timer: Timer;
  data: typeof Timer.jsonUpdate.Type;
}): Result.Result<
  {
    entity: Timer;
    changes: typeof Timer.jsonUpdate.Type;
  },
  never
> =>
  Result.succeed({
    entity: Timer.make({
      ...params.timer,
      ...params.data,
    }),
    changes: params.data,
  });

export const stopTimer = (params: {
  timer: Timer;
  now: DateTime.Utc;
}): Result.Result<
  { entity: TimeEntry; changes: typeof TimeEntry.jsonUpdate.Type },
  TimeEntryStoppedAtBeforeStartedAtError
> =>
  Result.gen(function* () {
    const timeEntry = TimeEntry.make({
      ...params.timer,
      stoppedAt: params.now,
    });

    yield* ensureValidDateRange(timeEntry.startedAt, params.now);

    return {
      entity: timeEntry,
      changes: {
        stoppedAt: params.now,
      },
    };
  });
