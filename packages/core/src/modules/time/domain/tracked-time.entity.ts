import { Schema } from "effect";

import { EntityModel } from "#internal/effect/index";
import {
  ProjectId,
  TaskId,
  TimerId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

const trackedTimeBaseFields = {
  workspaceId: EntityModel.ReadOnly(WorkspaceId),
  workspaceMemberId: EntityModel.ReadOnly(WorkspaceMemberId),
  projectId: EntityModel.CreateUpdate(ProjectId),
  taskId: EntityModel.CreateUpdateNullable(TaskId),
  notes: EntityModel.CreateUpdateNullable(Schema.Json),
} as const;

export class TimeEntry extends EntityModel.Class<TimeEntry>("TimeEntry")(
  {
    ...trackedTimeBaseFields,
    id: EntityModel.CreateOptional(TimeEntryId),
    startedAt: EntityModel.CreateUpdate(Schema.DateTimeUtcFromDate),
    stoppedAt: EntityModel.CreateUpdate(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "TimeEntry",
    title: "Time Entry",
    description: "A completed work interval tracked against a project",
  }
) {}

export class Timer extends EntityModel.Class<Timer>("Timer")(
  {
    ...trackedTimeBaseFields,
    id: EntityModel.CreateOptional(TimerId),
    startedAt: EntityModel.CreateOptional(Schema.DateTimeUtcFromDate),
  },
  {
    identifier: "Timer",
    title: "Timer",
    description: "Active tracking for a work interval that has not stopped",
  }
) {}
