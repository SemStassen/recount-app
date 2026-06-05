import { DateTime, Option, Result } from "effect";
import { describe, expect, it } from "vitest";

import {
  ProjectId,
  TimerId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Timer } from "./time-entry.entity";
import {
  createTimeEntry,
  startTimer,
  stopTimer,
  updateTimer,
} from "./time-entry.transitions";

const workspaceId = () => WorkspaceId.make(generateUUID());
const workspaceMemberId = () => WorkspaceMemberId.make(generateUUID());
const projectId = () => ProjectId.make(generateUUID());
const timerId = () => TimerId.make(generateUUID());

const startedAt = DateTime.makeUnsafe(new Date("2026-01-01T09:00:00.000Z"));
const stoppedAt = DateTime.makeUnsafe(new Date("2026-01-01T10:00:00.000Z"));
const now = DateTime.makeUnsafe(new Date("2026-01-01T11:00:00.000Z"));

const makeTimer = (overrides: Partial<Timer> = {}) =>
  Timer.make({
    id: timerId(),
    workspaceId: workspaceId(),
    workspaceMemberId: workspaceMemberId(),
    projectId: projectId(),
    taskId: Option.none(),
    startedAt,
    notes: Option.none(),
    ...overrides,
  });

describe("Time Entry transitions", () => {
  it("creates a Time Entry with an explicit stoppedAt", () => {
    const result = Result.getOrThrow(
      createTimeEntry({
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

  it("starts a Timer with backend time", () => {
    const result = Result.getOrThrow(
      startTimer({
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

  it("updates a Timer without clock changes", () => {
    const timer = makeTimer();
    const nextProjectId = projectId();

    const result = Result.getOrThrow(
      updateTimer({
        timer,
        data: {
          projectId: nextProjectId,
        },
      })
    );

    expect(result.entity.projectId).toBe(nextProjectId);
    expect(result.entity.startedAt).toBe(startedAt);
    expect(result.changes).toStrictEqual({ projectId: nextProjectId });
  });

  it("stops a Timer with backend time", () => {
    const timer = makeTimer();

    const result = Result.getOrThrow(
      stopTimer({
        timer,
        now,
      })
    );

    expect(result.entity.stoppedAt).toBe(now);
    expect(result.changes).toStrictEqual({ stoppedAt: now });
  });
});
