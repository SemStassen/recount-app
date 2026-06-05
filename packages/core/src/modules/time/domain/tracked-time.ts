import { Option, Schema } from "effect";

import { RecordModel } from "#internal/effect/index";
import {
  ProjectId,
  TaskId,
  TrackedTimeId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class TrackedTime extends RecordModel.Class<TrackedTime>("TrackedTime")(
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
    identifier: "TrackedTime",
    title: "Tracked Time",
    description: "Tracked time in either running or completed state",
  }
) {}

export const isRunningTrackedTime = (trackedTime: TrackedTime) =>
  Option.isNone(trackedTime.stoppedAt);
