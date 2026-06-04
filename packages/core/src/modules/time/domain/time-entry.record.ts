import { Option, Schema } from "effect";

import { RecordModel } from "#internal/effect/index";
import {
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class TimeEntryRecord extends RecordModel.Class<TimeEntryRecord>(
  "TimeEntryRecord"
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
    identifier: "TimeEntryRecord",
    title: "Time Entry Record",
    description: "The persistence record for a timer or time entry",
  }
) {}

export const isTimerRecord = (record: TimeEntryRecord) =>
  Option.isNone(record.stoppedAt);
