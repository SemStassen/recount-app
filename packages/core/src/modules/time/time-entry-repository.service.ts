import { Context } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import { TimeEntryRecord } from "./domain/time-entry-record";

export interface TimeEntryRepositoryShape {
  readonly insertMany: (
    data: ReadonlyArray<typeof TimeEntryRecord.insert.Type>
  ) => Effect.Effect<ReadonlyArray<TimeEntryRecord>, RepositoryError>;
  readonly update: (params: {
    workspaceId: TimeEntryRecord["workspaceId"];
    id: TimeEntryRecord["id"];
    update: typeof TimeEntryRecord.update.Type;
  }) => Effect.Effect<TimeEntryRecord, RepositoryError>;
  readonly hardDeleteMany: (params: {
    workspaceId: TimeEntryRecord["workspaceId"];
    ids: ReadonlyArray<TimeEntryRecord["id"]>;
  }) => Effect.Effect<void, RepositoryError>;
  readonly findById: (params: {
    workspaceId: TimeEntryRecord["workspaceId"];
    id: TimeEntryRecord["id"];
  }) => Effect.Effect<Option.Option<TimeEntryRecord>, RepositoryError>;
  readonly findRunningByWorkspaceMember: (params: {
    workspaceId: TimeEntryRecord["workspaceId"];
    workspaceMemberId: TimeEntryRecord["workspaceMemberId"];
  }) => Effect.Effect<Option.Option<TimeEntryRecord>, RepositoryError>;
  readonly updateRunningByWorkspaceMember: (params: {
    workspaceId: TimeEntryRecord["workspaceId"];
    workspaceMemberId: TimeEntryRecord["workspaceMemberId"];
    update: typeof TimeEntryRecord.update.Type;
  }) => Effect.Effect<Option.Option<TimeEntryRecord>, RepositoryError>;
}

export class TimeEntryRepository extends Context.Service<
  TimeEntryRepository,
  TimeEntryRepositoryShape
>()("@recount/time/TimeEntryRepository") {}
