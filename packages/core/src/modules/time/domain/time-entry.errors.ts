import { Schema } from "effect";

export class TimeEntryStoppedAtBeforeStartedAtError extends Schema.TaggedErrorClass<TimeEntryStoppedAtBeforeStartedAtError>()(
  "time/TimeEntryStoppedAtBeforeStartedAtError",
  {}
) {}

export class TimerAlreadyRunningError extends Schema.TaggedErrorClass<TimerAlreadyRunningError>()(
  "time/TimerAlreadyRunningError",
  {}
) {}

export class TimerNotFoundError extends Schema.TaggedErrorClass<TimerNotFoundError>()(
  "time/TimerNotFoundError",
  {}
) {}

export class CannotUpdateTimerError extends Schema.TaggedErrorClass<CannotUpdateTimerError>()(
  "time/CannotUpdateTimerError",
  {}
) {}
