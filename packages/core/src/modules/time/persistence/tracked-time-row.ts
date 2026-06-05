import { Schema } from "effect";

import { RecordModel } from "#internal/effect/index";
import {
  ProjectId,
  TaskId,
  TrackedTimeId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class TrackedTimeRow extends RecordModel.Class<TrackedTimeRow>(
  "TrackedTimeRow"
)(
  {
    id: RecordModel.Immutable(TrackedTimeId),
    workspaceId: RecordModel.Immutable(WorkspaceId),
    workspaceMemberId: RecordModel.Immutable(WorkspaceMemberId),
    projectId: RecordModel.Mutable(ProjectId),
    taskId: RecordModel.MutableNullable(TaskId),
    startedAt: RecordModel.Mutable(Schema.DateTimeUtcFromDate),
    stoppedAt: RecordModel.MutableNullable(Schema.DateTimeUtcFromDate),
    notes: RecordModel.MutableNullable(Schema.Json),
  },
  {
    identifier: "TrackedTimeRow",
    title: "Tracked Time Row",
    description: "Storage row for tracked time persistence",
  }
) {}
