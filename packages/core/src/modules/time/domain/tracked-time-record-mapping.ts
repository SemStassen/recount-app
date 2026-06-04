import { Option } from "effect";

import { Timer, TimeEntry } from "./time-entry.entity";
import { isTimerRecord, TrackedTimeRecord } from "./tracked-time-record";

export type TrackedTime = TimeEntry | Timer;

export const timeEntryFromRecord = (record: TrackedTimeRecord) =>
  TimeEntry.make({
    id: record.id,
    workspaceId: record.workspaceId,
    workspaceMemberId: record.workspaceMemberId,
    projectId: record.projectId,
    taskId: record.taskId,
    startedAt: record.startedAt,
    stoppedAt: Option.getOrThrow(record.stoppedAt),
    notes: record.notes,
  });

export const timerFromRecord = (record: TrackedTimeRecord) =>
  Timer.make({
    id: record.id,
    workspaceId: record.workspaceId,
    workspaceMemberId: record.workspaceMemberId,
    projectId: record.projectId,
    taskId: record.taskId,
    startedAt: record.startedAt,
    notes: record.notes,
  });

export const trackedTimeFromRecord = (record: TrackedTimeRecord): TrackedTime =>
  isTimerRecord(record) ? timerFromRecord(record) : timeEntryFromRecord(record);

export const recordUpdateFromTimeEntryChanges = (
  changes: typeof TimeEntry.jsonUpdate.Type
): typeof TrackedTimeRecord.update.Type => {
  const { stoppedAt, ...otherChanges } = changes;

  return stoppedAt === undefined
    ? otherChanges
    : {
        ...otherChanges,
        stoppedAt: Option.some(stoppedAt),
      };
};

export const recordUpdateFromTimerChanges = (
  changes: typeof Timer.jsonUpdate.Type
): typeof TrackedTimeRecord.update.Type => changes;

export const recordFromTimeEntry = (timeEntry: TimeEntry) =>
  TrackedTimeRecord.make({
    ...timeEntry,
    stoppedAt: Option.some(timeEntry.stoppedAt),
  });

export const recordFromTimer = (timer: Timer) =>
  TrackedTimeRecord.make({
    ...timer,
    stoppedAt: Option.none(),
  });
