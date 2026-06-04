import { DateTime, Option } from "effect";
import { describe, expect, it } from "vitest";

import {
  ProjectId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import {
  recordFromTimer,
  recordFromTimeEntry,
  timerFromRecord,
  timeEntryFromRecord,
  timeEntryOrTimerFromRecord,
} from "./time-entry-record-mapping";
import { Timer, TimeEntry } from "./time-entry.entity";
import { TimeEntryRecord } from "./time-entry.record";

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
  it("maps a completed Time Entry Record to a Time Entry", () => {
    const record = makeRecord();

    const timeEntry = timeEntryFromRecord(record);

    expect(timeEntry).toBeInstanceOf(TimeEntry);
    expect(timeEntry.stoppedAt).toBe(stoppedAt);
  });

  it("maps a running Time Entry Record to a Timer", () => {
    const record = makeRecord({ stoppedAt: Option.none() });

    const timeEntry = timerFromRecord(record);

    expect(timeEntry).toBeInstanceOf(Timer);
    expect("stoppedAt" in timeEntry).toBe(false);
  });

  it("classifies Time Entry Records by stoppedAt", () => {
    expect(timeEntryOrTimerFromRecord(makeRecord())).toBeInstanceOf(TimeEntry);
    expect(
      timeEntryOrTimerFromRecord(makeRecord({ stoppedAt: Option.none() }))
    ).toBeInstanceOf(Timer);
  });

  it("maps API-shaped Time Entries back to records", () => {
    const timeEntryRecord = makeRecord();
    const timeEntry = timeEntryFromRecord(timeEntryRecord);
    const timer = timerFromRecord(
      makeRecord({ stoppedAt: Option.none() })
    );

    expect(recordFromTimeEntry(timeEntry).stoppedAt).toEqual(
      Option.some(stoppedAt)
    );
    expect(recordFromTimer(timer).stoppedAt).toEqual(
      Option.none()
    );
  });
});
