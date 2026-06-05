import { Schema, Context } from "effect";
import type { Effect } from "effect";

import type { RepositoryError } from "#shared/repository/index";
import { TimeEntryId } from "#shared/schemas/index";

import type { Timer, TimeEntry } from "./domain/time-entry.entity";
import type {
  TimerNotFoundError,
  TimerAlreadyRunningError,
  TimeEntryStoppedAtBeforeStartedAtError,
} from "./domain/time-entry.errors";

export class TimeEntryNotFoundError extends Schema.TaggedErrorClass<TimeEntryNotFoundError>()(
  "time/TimeEntryNotFoundError",
  {
    timeEntryId: TimeEntryId,
  }
) {}

interface TimeModuleShape {
  readonly createTimeEntries: (params: {
    workspaceId: TimeEntry["workspaceId"];
    workspaceMemberId: TimeEntry["workspaceMemberId"];
    data: ReadonlyArray<typeof TimeEntry.jsonCreate.Type>;
  }) => Effect.Effect<
    ReadonlyArray<TimeEntry>,
    TimeEntryStoppedAtBeforeStartedAtError | RepositoryError
  >;
  readonly updateTimeEntry: (params: {
    workspaceId: TimeEntry["workspaceId"];
    id: TimeEntry["id"];
    data: typeof TimeEntry.jsonUpdate.Type;
  }) => Effect.Effect<
    TimeEntry,
    | TimeEntryNotFoundError
    | TimeEntryStoppedAtBeforeStartedAtError
    | RepositoryError
  >;
  readonly startTimer: (params: {
    workspaceId: Timer["workspaceId"];
    workspaceMemberId: Timer["workspaceMemberId"];
    data: typeof Timer.jsonCreate.Type & {
      startedAt?: Timer["startedAt"];
    };
  }) => Effect.Effect<Timer, TimerAlreadyRunningError | RepositoryError>;
  readonly updateTimer: (params: {
    workspaceId: Timer["workspaceId"];
    workspaceMemberId: Timer["workspaceMemberId"];
    data: typeof Timer.jsonUpdate.Type;
  }) => Effect.Effect<Timer, TimerNotFoundError | RepositoryError>;
  readonly stopTimer: (params: {
    workspaceId: Timer["workspaceId"];
    workspaceMemberId: Timer["workspaceMemberId"];
    data: {
      stoppedAt?: TimeEntry["stoppedAt"];
    };
  }) => Effect.Effect<
    TimeEntry,
    | TimerNotFoundError
    | TimeEntryStoppedAtBeforeStartedAtError
    | RepositoryError
  >;
  readonly hardDeleteTimeEntries: (params: {
    workspaceId: TimeEntry["workspaceId"];
    ids: ReadonlyArray<TimeEntry["id"]>;
  }) => Effect.Effect<void, RepositoryError>;
}

export class TimeModule extends Context.Service<TimeModule, TimeModuleShape>()(
  "@recount/time/TimeModule"
) {}
