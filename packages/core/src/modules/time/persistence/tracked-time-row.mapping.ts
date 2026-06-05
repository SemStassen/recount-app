import { Option } from "effect";

import { TimerId, TimeEntryId } from "#shared/schemas/index";

import { Timer, TimeEntry } from "../domain/tracked-time.entity";
import { TrackedTimeRow } from "./tracked-time-row";

export const isRunningTrackedTimeRow = (row: TrackedTimeRow) =>
  Option.isNone(row.stoppedAt);

export const timeEntryFromTrackedTimeRow = (row: TrackedTimeRow) => {
  if (Option.isNone(row.stoppedAt)) {
    throw new Error(
      `Tracked time row ${row.id} cannot be converted to a Time Entry without stoppedAt`
    );
  }

  return TimeEntry.make({
    id: TimeEntryId.make(row.id),
    workspaceId: row.workspaceId,
    workspaceMemberId: row.workspaceMemberId,
    projectId: row.projectId,
    taskId: row.taskId,
    startedAt: row.startedAt,
    stoppedAt: row.stoppedAt.value,
    notes: row.notes,
  });
};

export const timerFromTrackedTimeRow = (row: TrackedTimeRow) => {
  if (Option.isSome(row.stoppedAt)) {
    throw new Error(
      `Tracked time row ${row.id} cannot be converted to a Timer with stoppedAt`
    );
  }

  return Timer.make({
    id: TimerId.make(row.id),
    workspaceId: row.workspaceId,
    workspaceMemberId: row.workspaceMemberId,
    projectId: row.projectId,
    taskId: row.taskId,
    startedAt: row.startedAt,
    notes: row.notes,
  });
};

export const trackedTimeStateFromTrackedTimeRow = (
  row: TrackedTimeRow
): Timer | TimeEntry =>
  isRunningTrackedTimeRow(row)
    ? timerFromTrackedTimeRow(row)
    : timeEntryFromTrackedTimeRow(row);

export const trackedTimeUpdateFromTimeEntryChanges = (
  changes: typeof TimeEntry.jsonUpdate.Type
): typeof TrackedTimeRow.update.Type => {
  const { stoppedAt, ...otherChanges } = changes;

  return stoppedAt === undefined
    ? otherChanges
    : {
        ...otherChanges,
        stoppedAt: Option.some(stoppedAt),
      };
};

export const trackedTimeRowFromTimeEntry = (timeEntry: TimeEntry) =>
  TrackedTimeRow.make({
    ...timeEntry,
    stoppedAt: Option.some(timeEntry.stoppedAt),
  });

export const trackedTimeRowFromTimer = (timer: Timer) =>
  TrackedTimeRow.make({
    ...timer,
    stoppedAt: Option.none(),
  });
