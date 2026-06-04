import { Schema, Context } from "effect";
import type { Effect } from "effect";

import type { RepositoryError } from "#shared/repository/index";
import { TimeEntryId } from "#shared/schemas/index";

import type { RunningTimeEntry, TimeEntry } from "./domain/time-entry.entity";
import type {
  CannotUpdateRunningTimeEntryError,
  RunningTimeEntryNotFoundError,
  TimeEntryAlreadyRunningError,
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
    | CannotUpdateRunningTimeEntryError
    | RepositoryError
  >;
  readonly startRunningTimeEntry: (params: {
    workspaceId: RunningTimeEntry["workspaceId"];
    workspaceMemberId: RunningTimeEntry["workspaceMemberId"];
    data: typeof RunningTimeEntry.jsonCreate.Type;
  }) => Effect.Effect<
    RunningTimeEntry,
    TimeEntryAlreadyRunningError | RepositoryError
  >;
  readonly updateRunningTimeEntry: (params: {
    workspaceId: RunningTimeEntry["workspaceId"];
    workspaceMemberId: RunningTimeEntry["workspaceMemberId"];
    data: typeof RunningTimeEntry.jsonUpdate.Type;
  }) => Effect.Effect<
    RunningTimeEntry,
    RunningTimeEntryNotFoundError | RepositoryError
  >;
  readonly stopRunningTimeEntry: (params: {
    workspaceId: RunningTimeEntry["workspaceId"];
    workspaceMemberId: RunningTimeEntry["workspaceMemberId"];
  }) => Effect.Effect<
    TimeEntry,
    | RunningTimeEntryNotFoundError
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
