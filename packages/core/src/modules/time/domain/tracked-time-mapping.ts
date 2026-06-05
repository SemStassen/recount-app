import { Option } from "effect";

import { TimerId, TimeEntryId } from "#shared/schemas/index";

import { Timer, TimeEntry } from "./time-entry.entity";
import { isRunningTrackedTime, TrackedTime } from "./tracked-time";

export type TrackedTimeState = TimeEntry | Timer;

export const timeEntryFromTrackedTime = (trackedTime: TrackedTime) =>
  TimeEntry.make({
    id: TimeEntryId.make(trackedTime.id),
    workspaceId: trackedTime.workspaceId,
    workspaceMemberId: trackedTime.workspaceMemberId,
    projectId: trackedTime.projectId,
    taskId: trackedTime.taskId,
    startedAt: trackedTime.startedAt,
    stoppedAt: Option.getOrThrow(trackedTime.stoppedAt),
    notes: trackedTime.notes,
  });

export const timerFromTrackedTime = (trackedTime: TrackedTime) =>
  Timer.make({
    id: TimerId.make(trackedTime.id),
    workspaceId: trackedTime.workspaceId,
    workspaceMemberId: trackedTime.workspaceMemberId,
    projectId: trackedTime.projectId,
    taskId: trackedTime.taskId,
    startedAt: trackedTime.startedAt,
    notes: trackedTime.notes,
  });

export const trackedTimeStateFromTrackedTime = (
  trackedTime: TrackedTime
): TrackedTimeState =>
  isRunningTrackedTime(trackedTime)
    ? timerFromTrackedTime(trackedTime)
    : timeEntryFromTrackedTime(trackedTime);

export const trackedTimeUpdateFromTimeEntryChanges = (
  changes: typeof TimeEntry.jsonUpdate.Type
): typeof TrackedTime.update.Type => {
  const { stoppedAt, ...otherChanges } = changes;

  return stoppedAt === undefined
    ? otherChanges
    : {
        ...otherChanges,
        stoppedAt: Option.some(stoppedAt),
      };
};

export const trackedTimeUpdateFromTimerChanges = (
  changes: typeof Timer.jsonUpdate.Type
): typeof TrackedTime.update.Type => changes;

export const trackedTimeFromTimeEntry = (timeEntry: TimeEntry) =>
  TrackedTime.make({
    ...timeEntry,
    stoppedAt: Option.some(timeEntry.stoppedAt),
  });

export const trackedTimeFromTimer = (timer: Timer) =>
  TrackedTime.make({
    ...timer,
    stoppedAt: Option.none(),
  });
