import { Option, Schema } from "effect";

import { RecordModel } from "#internal/effect/index";
import {
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class TrackedTimeRecord extends RecordModel.Class<TrackedTimeRecord>(
  "TrackedTimeRecord"
)(
  {
    id: RecordModel.Immutable(TimeEntryId),
    workspaceId: RecordModel.Immutable(WorkspaceId),
    workspaceMemberId: RecordModel.Immutable(WorkspaceMemberId),
    projectId: RecordModel.Mutable(ProjectId),
    taskId: RecordModel.MutableNullable(TaskId),
    startedAt: RecordModel.Mutable(Schema.DateTimeUtcFromDate),
    stoppedAt: RecordModel.MutableNullable(Schema.DateTimeUtcFromDate),
    notes: RecordModel.MutableNullable(Schema.Json),
  },
  {
    identifier: "TrackedTimeRecord",
    title: "Tracked Time Record",
    description: "The persistence record for tracked time",
  }
) {}

export const isTimerRecord = (record: TrackedTimeRecord) =>
  Option.isNone(record.stoppedAt);
