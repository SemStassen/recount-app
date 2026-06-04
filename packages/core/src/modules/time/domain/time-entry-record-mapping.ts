import { Option } from "effect";

import { Timer, TimeEntry } from "./time-entry.entity";
import { isTimerRecord, TimeEntryRecord } from "./time-entry.record";

export type TimeEntryOrTimer = TimeEntry | Timer;

export const timeEntryFromRecord = (record: TimeEntryRecord) =>
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

export const timerFromRecord = (record: TimeEntryRecord) =>
  Timer.make({
    id: record.id,
    workspaceId: record.workspaceId,
    workspaceMemberId: record.workspaceMemberId,
    projectId: record.projectId,
    taskId: record.taskId,
    startedAt: record.startedAt,
    notes: record.notes,
  });

export const timeEntryOrTimerFromRecord = (
  record: TimeEntryRecord
): TimeEntryOrTimer =>
  isTimerRecord(record)
    ? timerFromRecord(record)
    : timeEntryFromRecord(record);

export const recordFromTimeEntry = (timeEntry: TimeEntry) =>
  TimeEntryRecord.make({
    ...timeEntry,
    stoppedAt: Option.some(timeEntry.stoppedAt),
  });

export const recordFromTimer = (timer: Timer) =>
  TimeEntryRecord.make({
    ...timer,
    stoppedAt: Option.none(),
  });
