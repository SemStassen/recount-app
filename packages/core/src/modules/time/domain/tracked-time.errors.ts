import { Schema } from "effect";

import {
  ProjectId,
  TaskId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";

export class TimeEntryStoppedAtBeforeStartedAtError extends Schema.TaggedErrorClass<TimeEntryStoppedAtBeforeStartedAtError>()(
  "time/TimeEntryStoppedAtBeforeStartedAtError",
  {}
) {}

export class TargetProjectNotFoundError extends Schema.TaggedErrorClass<TargetProjectNotFoundError>()(
  "time/TargetProjectNotFoundError",
  {
    workspaceId: WorkspaceId,
    projectId: ProjectId,
  }
) {}

export class TargetTaskNotFoundError extends Schema.TaggedErrorClass<TargetTaskNotFoundError>()(
  "time/TargetTaskNotFoundError",
  {
    workspaceId: WorkspaceId,
    taskId: TaskId,
  }
) {}

export class TargetTaskProjectMismatchError extends Schema.TaggedErrorClass<TargetTaskProjectMismatchError>()(
  "time/TargetTaskProjectMismatchError",
  {
    workspaceId: WorkspaceId,
    projectId: ProjectId,
    taskId: TaskId,
  }
) {}

export class TimerAlreadyRunningError extends Schema.TaggedErrorClass<TimerAlreadyRunningError>()(
  "time/TimerAlreadyRunningError",
  {
    workspaceId: WorkspaceId,
    workspaceMemberId: WorkspaceMemberId,
  }
) {}

export class TimerNotFoundError extends Schema.TaggedErrorClass<TimerNotFoundError>()(
  "time/TimerNotFoundError",
  {
    workspaceId: WorkspaceId,
    workspaceMemberId: WorkspaceMemberId,
  }
) {}
