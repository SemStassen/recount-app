import { Schema } from "effect";

import { WorkspaceId, WorkspaceMemberId } from "#shared/schemas/index";

export class TimeEntryStoppedAtBeforeStartedAtError extends Schema.TaggedErrorClass<TimeEntryStoppedAtBeforeStartedAtError>()(
  "time/TimeEntryStoppedAtBeforeStartedAtError",
  {}
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
