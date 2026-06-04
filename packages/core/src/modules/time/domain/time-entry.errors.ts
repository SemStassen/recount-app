import { Schema } from "effect";

export class TimeEntryStoppedAtBeforeStartedAtError extends Schema.TaggedErrorClass<TimeEntryStoppedAtBeforeStartedAtError>()(
  "time/TimeEntryStoppedAtBeforeStartedAtError",
  {}
) {}

export class TimeEntryAlreadyRunningError extends Schema.TaggedErrorClass<TimeEntryAlreadyRunningError>()(
  "time/TimeEntryAlreadyRunningError",
  {}
) {}

export class RunningTimeEntryNotFoundError extends Schema.TaggedErrorClass<RunningTimeEntryNotFoundError>()(
  "time/RunningTimeEntryNotFoundError",
  {}
) {}

export class CannotUpdateRunningTimeEntryError extends Schema.TaggedErrorClass<CannotUpdateRunningTimeEntryError>()(
  "time/CannotUpdateRunningTimeEntryError",
  {}
) {}
