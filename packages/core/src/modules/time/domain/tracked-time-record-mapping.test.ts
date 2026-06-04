import { DateTime, Option } from "effect";
import { describe, expect, it } from "vitest";

import {
  ProjectId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Timer, TimeEntry } from "./time-entry.entity";
import { TrackedTimeRecord } from "./tracked-time-record";
import {
  recordFromTimer,
  recordFromTimeEntry,
  recordUpdateFromTimeEntryChanges,
  recordUpdateFromTimerChanges,
  timerFromRecord,
  timeEntryFromRecord,
  trackedTimeFromRecord,
} from "./tracked-time-record-mapping";

const startedAt = DateTime.makeUnsafe(new Date("2026-01-01T09:00:00.000Z"));
const stoppedAt = DateTime.makeUnsafe(new Date("2026-01-01T10:00:00.000Z"));

const makeRecord = (overrides: Partial<TrackedTimeRecord> = {}) =>
  TrackedTimeRecord.make({
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

describe("Tracked Time Record mapping", () => {
  it("maps a completed Tracked Time Record to a Time Entry", () => {
    const record = makeRecord();

    const timeEntry = timeEntryFromRecord(record);

    expect(timeEntry).toBeInstanceOf(TimeEntry);
    expect(timeEntry.stoppedAt).toBe(stoppedAt);
  });

  it("maps a running Tracked Time Record to a Timer", () => {
    const record = makeRecord({ stoppedAt: Option.none() });

    const timeEntry = timerFromRecord(record);

    expect(timeEntry).toBeInstanceOf(Timer);
    expect("stoppedAt" in timeEntry).toBe(false);
  });

  it("classifies Tracked Time Records by stoppedAt", () => {
    expect(trackedTimeFromRecord(makeRecord())).toBeInstanceOf(TimeEntry);
    expect(
      trackedTimeFromRecord(makeRecord({ stoppedAt: Option.none() }))
    ).toBeInstanceOf(Timer);
  });

  it("maps API-shaped Time Entries back to records", () => {
    const trackedTimeRecord = makeRecord();
    const timeEntry = timeEntryFromRecord(trackedTimeRecord);
    const timer = timerFromRecord(makeRecord({ stoppedAt: Option.none() }));

    expect(recordFromTimeEntry(timeEntry).stoppedAt).toEqual(
      Option.some(stoppedAt)
    );
    expect(recordFromTimer(timer).stoppedAt).toEqual(Option.none());
  });

  it("maps Time Entry partial updates to record partial updates", () => {
    expect(
      recordUpdateFromTimeEntryChanges({
        stoppedAt,
      })
    ).toEqual({
      stoppedAt: Option.some(stoppedAt),
    });

    expect(recordUpdateFromTimeEntryChanges({ notes: Option.none() })).toEqual({
      notes: Option.none(),
    });
  });

  it("maps Timer partial updates to record partial updates", () => {
    expect(recordUpdateFromTimerChanges({ notes: Option.none() })).toEqual({
      notes: Option.none(),
    });
  });
});
