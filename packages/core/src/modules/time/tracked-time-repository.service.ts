import { Context, Schema } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";
import { WorkspaceId, WorkspaceMemberId } from "#shared/schemas/index";

import type { Timer, TimeEntry } from "./domain/time-entry.entity";

export class CurrentTimerConflictError extends Schema.TaggedErrorClass<CurrentTimerConflictError>()(
  "time/CurrentTimerConflictError",
  {
    workspaceId: WorkspaceId,
    workspaceMemberId: WorkspaceMemberId,
  }
) {}

export interface TrackedTimeRepositoryShape {
  readonly insertTimeEntries: (
    timeEntries: ReadonlyArray<TimeEntry>
  ) => Effect.Effect<ReadonlyArray<TimeEntry>, RepositoryError>;
  readonly updateTimeEntry: (params: {
    workspaceId: TimeEntry["workspaceId"];
    id: TimeEntry["id"];
    data: typeof TimeEntry.jsonUpdate.Type;
  }) => Effect.Effect<TimeEntry, RepositoryError>;
  readonly hardDeleteMany: (params: {
    workspaceId: TimeEntry["workspaceId"];
    ids: ReadonlyArray<TimeEntry["id"]>;
  }) => Effect.Effect<void, RepositoryError>;
  readonly findTimeEntry: (params: {
    workspaceId: TimeEntry["workspaceId"];
    id: TimeEntry["id"];
  }) => Effect.Effect<Option.Option<TimeEntry>, RepositoryError>;
  readonly findCurrentTimer: (params: {
    workspaceId: Timer["workspaceId"];
    workspaceMemberId: Timer["workspaceMemberId"];
  }) => Effect.Effect<Option.Option<Timer>, RepositoryError>;
  readonly insertCurrentTimer: (
    timer: Timer
  ) => Effect.Effect<Timer, CurrentTimerConflictError | RepositoryError>;
  readonly updateCurrentTimer: (params: {
    workspaceId: Timer["workspaceId"];
    workspaceMemberId: Timer["workspaceMemberId"];
    data: typeof Timer.jsonUpdate.Type;
  }) => Effect.Effect<Option.Option<Timer>, RepositoryError>;
  readonly completeCurrentTimer: (params: {
    workspaceId: Timer["workspaceId"];
    workspaceMemberId: Timer["workspaceMemberId"];
    timeEntry: TimeEntry;
  }) => Effect.Effect<Option.Option<TimeEntry>, RepositoryError>;
}

export class TrackedTimeRepository extends Context.Service<
  TrackedTimeRepository,
  TrackedTimeRepositoryShape
>()("@recount/time/TrackedTimeRepository") {}
