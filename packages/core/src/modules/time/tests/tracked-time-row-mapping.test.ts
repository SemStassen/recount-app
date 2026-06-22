import { DateTime, Option, Result } from "effect";
import { describe, expect, it } from "vitest";

import {
  ProjectId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Timer, TimeEntry } from "../domain/tracked-time.entity";
import {
  timerFromTrackedTimeRow,
  timeEntryFromTrackedTimeRow,
  TrackedTimeRow,
  trackedTimeRowFromTimeEntry,
  trackedTimeRowFromTimer,
  trackedTimeStateFromTrackedTimeRow,
  trackedTimeUpdateFromTimeEntryChanges,
} from "../persistence";

const startedAt = DateTime.makeUnsafe(new Date("2026-01-01T09:00:00.000Z"));
const stoppedAt = DateTime.makeUnsafe(new Date("2026-01-01T10:00:00.000Z"));

const makeTrackedTimeRow = (overrides: Partial<TrackedTimeRow> = {}) =>
  TrackedTimeRow.make({
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

describe("Tracked Time mapping", () => {
  it("maps completed Tracked Time to a Time Entry", () => {
    const row = makeTrackedTimeRow();

    const timeEntry = Result.getOrThrow(timeEntryFromTrackedTimeRow(row));

    expect(timeEntry).toBeInstanceOf(TimeEntry);
    expect(timeEntry.stoppedAt).toBe(stoppedAt);
  });

  it("maps running Tracked Time to a Timer", () => {
    const row = makeTrackedTimeRow({ stoppedAt: Option.none() });

    const timeEntry = Result.getOrThrow(timerFromTrackedTimeRow(row));

    expect(timeEntry).toBeInstanceOf(Timer);
    expect("stoppedAt" in timeEntry).toBe(false);
  });

  it("classifies Tracked Time by stoppedAt", () => {
    expect(
      Result.getOrThrow(
        trackedTimeStateFromTrackedTimeRow(makeTrackedTimeRow())
      )
    ).toBeInstanceOf(TimeEntry);
    expect(
      Result.getOrThrow(
        trackedTimeStateFromTrackedTimeRow(
          makeTrackedTimeRow({ stoppedAt: Option.none() })
        )
      )
    ).toBeInstanceOf(Timer);
  });

  it("returns a typed failure when mapping to the wrong Tracked Time state", () => {
    const timeEntryRow = makeTrackedTimeRow();
    const timerRow = makeTrackedTimeRow({ stoppedAt: Option.none() });
    const timerResult = timerFromTrackedTimeRow(timeEntryRow);
    const timeEntryResult = timeEntryFromTrackedTimeRow(timerRow);

    expect(Result.isFailure(timerResult)).toBe(true);
    expect(Result.isFailure(timeEntryResult)).toBe(true);
    if (Result.isFailure(timerResult)) {
      expect(timerResult.failure).toMatchObject({
        _tag: "time/TrackedTimeRowStateMismatchError",
        trackedTimeId: timeEntryRow.id,
        expectedState: "timer",
      });
    }
    if (Result.isFailure(timeEntryResult)) {
      expect(timeEntryResult.failure).toMatchObject({
        _tag: "time/TrackedTimeRowStateMismatchError",
        trackedTimeId: timerRow.id,
        expectedState: "time-entry",
      });
    }
  });

  it("maps API-shaped Time Entries back to Tracked Time", () => {
    const row = makeTrackedTimeRow();
    const timeEntry = Result.getOrThrow(timeEntryFromTrackedTimeRow(row));
    const timer = Result.getOrThrow(
      timerFromTrackedTimeRow(makeTrackedTimeRow({ stoppedAt: Option.none() }))
    );

    expect(trackedTimeRowFromTimeEntry(timeEntry).stoppedAt).toEqual(
      Option.some(stoppedAt)
    );
    expect(trackedTimeRowFromTimer(timer).stoppedAt).toEqual(Option.none());
  });

  it("maps Time Entry partial updates to Tracked Time partial updates", () => {
    expect(
      trackedTimeUpdateFromTimeEntryChanges({
        stoppedAt,
      })
    ).toEqual({
      stoppedAt: Option.some(stoppedAt),
    });

    expect(
      trackedTimeUpdateFromTimeEntryChanges({ notes: Option.none() })
    ).toEqual({ notes: Option.none() });
  });
});
