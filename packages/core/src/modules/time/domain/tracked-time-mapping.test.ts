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
import { TrackedTime } from "./tracked-time";
import {
  timerFromTrackedTime,
  timeEntryFromTrackedTime,
  trackedTimeFromTimeEntry,
  trackedTimeFromTimer,
  trackedTimeStateFromTrackedTime,
  trackedTimeUpdateFromTimeEntryChanges,
  trackedTimeUpdateFromTimerChanges,
} from "./tracked-time-mapping";

const startedAt = DateTime.makeUnsafe(new Date("2026-01-01T09:00:00.000Z"));
const stoppedAt = DateTime.makeUnsafe(new Date("2026-01-01T10:00:00.000Z"));

const makeTrackedTime = (overrides: Partial<TrackedTime> = {}) =>
  TrackedTime.make({
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
    const trackedTime = makeTrackedTime();

    const timeEntry = timeEntryFromTrackedTime(trackedTime);

    expect(timeEntry).toBeInstanceOf(TimeEntry);
    expect(timeEntry.stoppedAt).toBe(stoppedAt);
  });

  it("maps running Tracked Time to a Timer", () => {
    const trackedTime = makeTrackedTime({ stoppedAt: Option.none() });

    const timeEntry = timerFromTrackedTime(trackedTime);

    expect(timeEntry).toBeInstanceOf(Timer);
    expect("stoppedAt" in timeEntry).toBe(false);
  });

  it("classifies Tracked Time by stoppedAt", () => {
    expect(trackedTimeStateFromTrackedTime(makeTrackedTime())).toBeInstanceOf(
      TimeEntry
    );
    expect(
      trackedTimeStateFromTrackedTime(
        makeTrackedTime({ stoppedAt: Option.none() })
      )
    ).toBeInstanceOf(Timer);
  });

  it("maps API-shaped Time Entries back to Tracked Time", () => {
    const trackedTime = makeTrackedTime();
    const timeEntry = timeEntryFromTrackedTime(trackedTime);
    const timer = timerFromTrackedTime(
      makeTrackedTime({ stoppedAt: Option.none() })
    );

    expect(trackedTimeFromTimeEntry(timeEntry).stoppedAt).toEqual(
      Option.some(stoppedAt)
    );
    expect(trackedTimeFromTimer(timer).stoppedAt).toEqual(Option.none());
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

  it("maps Timer partial updates to Tracked Time partial updates", () => {
    expect(trackedTimeUpdateFromTimerChanges({ notes: Option.none() })).toEqual(
      {
        notes: Option.none(),
      }
    );
  });
});
