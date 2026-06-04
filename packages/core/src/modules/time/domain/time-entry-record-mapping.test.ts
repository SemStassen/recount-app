import { DateTime, Option } from "effect";
import { describe, expect, it } from "vitest";

import {
  ProjectId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { TimeEntryRecord } from "./time-entry-record";
import {
  recordFromRunningTimeEntry,
  recordFromStoppedTimeEntry,
  runningTimeEntryFromRecord,
  stoppedTimeEntryFromRecord,
  timeEntryApiShapeFromRecord,
} from "./time-entry-record-mapping";
import { RunningTimeEntry, TimeEntry } from "./time-entry.entity";

const startedAt = DateTime.makeUnsafe(new Date("2026-01-01T09:00:00.000Z"));
const stoppedAt = DateTime.makeUnsafe(new Date("2026-01-01T10:00:00.000Z"));

const makeRecord = (overrides: Partial<TimeEntryRecord> = {}) =>
  TimeEntryRecord.make({
    id: TimeEntryId.make(generateUUID()),
    workspaceId: WorkspaceId.make(generateUUID()),
    workspaceMemberId: WorkspaceMemberId.make(generateUUID()),
    projectId: ProjectId.make(generateUUID()),
    taskId: Option.none(),
    startedAt,
    stoppedAt: Option.some(stoppedAt),
    notes: Option.none(),
    ...overrides,
  });

describe("Time Entry record mapping", () => {
  it("maps a stopped Time Entry Record to a Time Entry", () => {
    const record = makeRecord();

    const timeEntry = stoppedTimeEntryFromRecord(record);

    expect(timeEntry).toBeInstanceOf(TimeEntry);
    expect(timeEntry.stoppedAt).toBe(stoppedAt);
  });

  it("maps a running Time Entry Record to a Running Time Entry", () => {
    const record = makeRecord({ stoppedAt: Option.none() });

    const timeEntry = runningTimeEntryFromRecord(record);

    expect(timeEntry).toBeInstanceOf(RunningTimeEntry);
    expect("stoppedAt" in timeEntry).toBe(false);
  });

  it("classifies Time Entry Records by stoppedAt", () => {
    expect(timeEntryApiShapeFromRecord(makeRecord())).toBeInstanceOf(TimeEntry);
    expect(
      timeEntryApiShapeFromRecord(makeRecord({ stoppedAt: Option.none() }))
    ).toBeInstanceOf(RunningTimeEntry);
  });

  it("maps API-shaped Time Entries back to records", () => {
    const stoppedRecord = makeRecord();
    const stoppedTimeEntry = stoppedTimeEntryFromRecord(stoppedRecord);
    const runningTimeEntry = runningTimeEntryFromRecord(
      makeRecord({ stoppedAt: Option.none() })
    );

    expect(recordFromStoppedTimeEntry(stoppedTimeEntry).stoppedAt).toEqual(
      Option.some(stoppedAt)
    );
    expect(recordFromRunningTimeEntry(runningTimeEntry).stoppedAt).toEqual(
      Option.none()
    );
  });
});
