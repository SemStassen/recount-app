import { Context } from "effect";
import type { Effect, Option } from "effect";

import type { RepositoryError } from "#shared/repository/index";

import { TrackedTimeRecord } from "./domain/tracked-time-record";

export interface TrackedTimeRepositoryShape {
  readonly insertMany: (
    data: ReadonlyArray<typeof TrackedTimeRecord.insert.Type>
  ) => Effect.Effect<ReadonlyArray<TrackedTimeRecord>, RepositoryError>;
  readonly update: (params: {
    workspaceId: TrackedTimeRecord["workspaceId"];
    id: TrackedTimeRecord["id"];
    update: typeof TrackedTimeRecord.update.Type;
  }) => Effect.Effect<TrackedTimeRecord, RepositoryError>;
  readonly hardDeleteMany: (params: {
    workspaceId: TrackedTimeRecord["workspaceId"];
    ids: ReadonlyArray<TrackedTimeRecord["id"]>;
  }) => Effect.Effect<void, RepositoryError>;
  readonly findById: (params: {
    workspaceId: TrackedTimeRecord["workspaceId"];
    id: TrackedTimeRecord["id"];
  }) => Effect.Effect<Option.Option<TrackedTimeRecord>, RepositoryError>;
  readonly findTimerRecordByWorkspaceMember: (params: {
    workspaceId: TrackedTimeRecord["workspaceId"];
    workspaceMemberId: TrackedTimeRecord["workspaceMemberId"];
  }) => Effect.Effect<Option.Option<TrackedTimeRecord>, RepositoryError>;
  readonly updateTimerRecordByWorkspaceMember: (params: {
    workspaceId: TrackedTimeRecord["workspaceId"];
    workspaceMemberId: TrackedTimeRecord["workspaceMemberId"];
    update: typeof TrackedTimeRecord.update.Type;
  }) => Effect.Effect<Option.Option<TrackedTimeRecord>, RepositoryError>;
}

export class TrackedTimeRepository extends Context.Service<
  TrackedTimeRepository,
  TrackedTimeRepositoryShape
>()("@recount/time/TrackedTimeRepository") {}
