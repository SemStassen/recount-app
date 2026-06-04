import { DateTime, Option, Result } from "effect";
import { describe, expect, it } from "vitest";

import {
  ProjectId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { RunningTimeEntry } from "./time-entry.entity";
import {
  createStoppedTimeEntry,
  startRunningTimeEntry,
  stopRunningTimeEntry,
  updateRunningTimeEntry,
} from "./time-entry.transitions";

const workspaceId = () => WorkspaceId.make(generateUUID());
const workspaceMemberId = () => WorkspaceMemberId.make(generateUUID());
const projectId = () => ProjectId.make(generateUUID());
const timeEntryId = () => TimeEntryId.make(generateUUID());

const startedAt = DateTime.makeUnsafe(new Date("2026-01-01T09:00:00.000Z"));
const stoppedAt = DateTime.makeUnsafe(new Date("2026-01-01T10:00:00.000Z"));
const now = DateTime.makeUnsafe(new Date("2026-01-01T11:00:00.000Z"));

const makeRunningTimeEntry = (overrides: Partial<RunningTimeEntry> = {}) =>
  RunningTimeEntry.make({
    id: timeEntryId(),
    workspaceId: workspaceId(),
    workspaceMemberId: workspaceMemberId(),
    projectId: projectId(),
    taskId: Option.none(),
    startedAt,
    notes: Option.none(),
    ...overrides,
  });

describe("Time Entry transitions", () => {
  it("creates a stopped Time Entry with an explicit stoppedAt", () => {
    const result = Result.getOrThrow(
      createStoppedTimeEntry({
        workspaceId: workspaceId(),
        workspaceMemberId: workspaceMemberId(),
        now,
        data: {
          id: Option.none(),
          projectId: projectId(),
          startedAt,
          stoppedAt,
        },
      })
    );

    expect(result.startedAt).toBe(startedAt);
    expect(result.stoppedAt).toBe(stoppedAt);
  });

  it("starts a Running Time Entry with backend time", () => {
    const result = Result.getOrThrow(
      startRunningTimeEntry({
        workspaceId: workspaceId(),
        workspaceMemberId: workspaceMemberId(),
        now,
        data: {
          id: Option.none(),
          projectId: projectId(),
        },
      })
    );

    expect(result.startedAt).toBe(now);
  });

  it("updates a Running Time Entry without clock changes", () => {
    const runningTimeEntry = makeRunningTimeEntry();
    const nextProjectId = projectId();

    const result = Result.getOrThrow(
      updateRunningTimeEntry({
        timeEntry: runningTimeEntry,
        data: {
          projectId: nextProjectId,
        },
      })
    );

    expect(result.entity.projectId).toBe(nextProjectId);
    expect(result.entity.startedAt).toBe(startedAt);
    expect(result.changes).toStrictEqual({ projectId: nextProjectId });
  });

  it("stops a Running Time Entry with backend time", () => {
    const runningTimeEntry = makeRunningTimeEntry();

    const result = Result.getOrThrow(
      stopRunningTimeEntry({
        timeEntry: runningTimeEntry,
        now,
      })
    );

    expect(result.entity.stoppedAt).toBe(now);
    expect(result.changes).toStrictEqual({ stoppedAt: now });
  });
});
