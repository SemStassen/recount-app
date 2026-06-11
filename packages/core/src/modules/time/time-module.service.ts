import { Schema, Context } from "effect";
import type { Effect } from "effect";

import type { RepositoryError } from "#shared/repository/index";
import { TimeEntryId, WorkspaceId } from "#shared/schemas/index";

import type { Timer, TimeEntry } from "./domain/tracked-time.entity";
import type {
  TimerNotFoundError,
  TimerAlreadyRunningError,
  TimeEntryStoppedAtBeforeStartedAtError,
  TargetProjectNotFoundError,
  TargetTaskNotFoundError,
  TargetTaskProjectMismatchError,
} from "./domain/tracked-time.errors";

export class TimeEntryNotFoundError extends Schema.TaggedErrorClass<TimeEntryNotFoundError>()(
  "time/TimeEntryNotFoundError",
  {
    workspaceId: WorkspaceId,
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
    | TimeEntryStoppedAtBeforeStartedAtError
    | TargetProjectNotFoundError
    | TargetTaskNotFoundError
    | TargetTaskProjectMismatchError
    | RepositoryError
  >;
  readonly updateTimeEntry: (params: {
    workspaceId: TimeEntry["workspaceId"];
    id: TimeEntry["id"];
    data: typeof TimeEntry.jsonUpdate.Type;
  }) => Effect.Effect<
    TimeEntry,
    | TimeEntryNotFoundError
    | TimeEntryStoppedAtBeforeStartedAtError
    | TargetProjectNotFoundError
    | TargetTaskNotFoundError
    | TargetTaskProjectMismatchError
    | RepositoryError
  >;
  readonly startTimer: (params: {
    workspaceId: Timer["workspaceId"];
    workspaceMemberId: Timer["workspaceMemberId"];
    data: typeof Timer.jsonCreate.Type;
  }) => Effect.Effect<
    Timer,
    | TimerAlreadyRunningError
    | TargetProjectNotFoundError
    | TargetTaskNotFoundError
    | TargetTaskProjectMismatchError
    | RepositoryError
  >;
  readonly updateTimer: (params: {
    workspaceId: Timer["workspaceId"];
    workspaceMemberId: Timer["workspaceMemberId"];
    data: typeof Timer.jsonUpdate.Type;
  }) => Effect.Effect<
    Timer,
    | TimerNotFoundError
    | TargetProjectNotFoundError
    | TargetTaskNotFoundError
    | TargetTaskProjectMismatchError
    | RepositoryError
  >;
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
