import { DateTime, Option, Result } from "effect";

import { TimeEntryId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { RunningTimeEntry, TimeEntry } from "./time-entry.entity";
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

export const createStoppedTimeEntry = (params: {
  workspaceId: TimeEntry["workspaceId"];
  workspaceMemberId: TimeEntry["workspaceMemberId"];
  data: typeof TimeEntry.jsonCreate.Type;
  now: DateTime.Utc;
}): Result.Result<TimeEntry, TimeEntryStoppedAtBeforeStartedAtError> =>
  Result.gen(function* () {
    const timeEntry = yield* createTimeEntry(params);

    return timeEntry;
  });

export const startRunningTimeEntry = (params: {
  workspaceId: RunningTimeEntry["workspaceId"];
  workspaceMemberId: RunningTimeEntry["workspaceMemberId"];
  data: typeof RunningTimeEntry.jsonCreate.Type;
  now: DateTime.Utc;
}): Result.Result<RunningTimeEntry, never> =>
  Result.succeed(
    (() => {
      const { id, ...data } = params.data;

      return RunningTimeEntry.make({
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

export const updateRunningTimeEntry = (params: {
  timeEntry: RunningTimeEntry;
  data: typeof RunningTimeEntry.jsonUpdate.Type;
}): Result.Result<
  {
    entity: RunningTimeEntry;
    changes: typeof RunningTimeEntry.jsonUpdate.Type;
  },
  never
> =>
  Result.succeed({
    entity: RunningTimeEntry.make({
      ...params.timeEntry,
      ...params.data,
    }),
    changes: params.data,
  });

export const stopRunningTimeEntry = (params: {
  timeEntry: RunningTimeEntry;
  now: DateTime.Utc;
}): Result.Result<
  { entity: TimeEntry; changes: typeof TimeEntry.jsonUpdate.Type },
  TimeEntryStoppedAtBeforeStartedAtError
> =>
  Result.gen(function* () {
    const stoppedTimeEntry = TimeEntry.make({
      ...params.timeEntry,
      stoppedAt: params.now,
    });

    yield* ensureValidDateRange(stoppedTimeEntry.startedAt, params.now);

    return {
      entity: stoppedTimeEntry,
      changes: {
        stoppedAt: params.now,
      },
    };
  });
