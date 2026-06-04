import { Schema } from "effect";

import { EntityModel } from "#internal/effect/index";
import {
  ProjectId,
  TaskId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

const timeEntryBaseFields = {
  id: EntityModel.CreateOptional(TimeEntryId),
  workspaceId: EntityModel.ReadOnly(WorkspaceId),
  workspaceMemberId: EntityModel.ReadOnly(WorkspaceMemberId),
  projectId: EntityModel.CreateUpdate(ProjectId),
  taskId: EntityModel.CreateUpdateNullable(TaskId),
  notes: EntityModel.CreateUpdateNullable(Schema.Json),
} as const;

export class TimeEntry extends EntityModel.Class<TimeEntry>("TimeEntry")(
  {
    ...timeEntryBaseFields,
    startedAt: EntityModel.Field({
      json: Schema.DateTimeUtcFromDate,
      jsonCreate: Schema.optionalKey(Schema.DateTimeUtcFromDate),
      jsonUpdate: Schema.optionalKey(Schema.DateTimeUtcFromDate),
    }),
    stoppedAt: EntityModel.CreateUpdate(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "TimeEntry",
    title: "Time Entry",
    description: "A stopped time entry tracking work on a project",
  }
) {}

export class RunningTimeEntry extends EntityModel.Class<RunningTimeEntry>(
  "RunningTimeEntry"
)(
  {
    ...timeEntryBaseFields,
    startedAt: EntityModel.ReadOnly(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "RunningTimeEntry",
    title: "Running Time Entry",
    description: "A time entry that has started but has not stopped",
  }
) {}
