import { Option } from "effect";

import { isRunningTimeEntryRecord, TimeEntryRecord } from "./time-entry-record";
import { RunningTimeEntry, TimeEntry } from "./time-entry.entity";

export type TimeEntryApiShape = TimeEntry | RunningTimeEntry;

export const stoppedTimeEntryFromRecord = (record: TimeEntryRecord) =>
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

export const runningTimeEntryFromRecord = (record: TimeEntryRecord) =>
  RunningTimeEntry.make({
    id: record.id,
    workspaceId: record.workspaceId,
    workspaceMemberId: record.workspaceMemberId,
    projectId: record.projectId,
    taskId: record.taskId,
    startedAt: record.startedAt,
    notes: record.notes,
  });

export const timeEntryApiShapeFromRecord = (
  record: TimeEntryRecord
): TimeEntryApiShape =>
  isRunningTimeEntryRecord(record)
    ? runningTimeEntryFromRecord(record)
    : stoppedTimeEntryFromRecord(record);

export const recordFromStoppedTimeEntry = (timeEntry: TimeEntry) =>
  TimeEntryRecord.make({
    ...timeEntry,
    stoppedAt: Option.some(timeEntry.stoppedAt),
  });

export const recordFromRunningTimeEntry = (timeEntry: RunningTimeEntry) =>
  TimeEntryRecord.make({
    ...timeEntry,
    stoppedAt: Option.none(),
  });
