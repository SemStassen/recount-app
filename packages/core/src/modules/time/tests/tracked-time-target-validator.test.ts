import { DateTime, Effect, Layer, Option } from "effect";
import { describe, expect, it } from "vitest";

import {
  ProjectId,
  TaskId,
  TimerId,
  TimeEntryId,
  WorkspaceId,
  WorkspaceMemberId,
} from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Timer, TimeEntry } from "../domain/tracked-time.entity";
import {
  TimerAlreadyRunningError,
  TargetProjectNotFoundError,
  TargetTaskNotFoundError,
  TargetTaskProjectMismatchError,
} from "../domain/tracked-time.errors";
import { TrackedTimeRepository } from "../persistence";
import { TrackedTimeTargetValidator } from "../ports";
import { TimeModuleLayer } from "../time-module.layer";
import { TimeModule } from "../time-module.service";

const startedAt = DateTime.makeUnsafe(new Date("2026-01-01T09:00:00.000Z"));
const stoppedAt = DateTime.makeUnsafe(new Date("2026-01-01T10:00:00.000Z"));

const workspaceId = () => WorkspaceId.make(generateUUID());
const workspaceMemberId = () => WorkspaceMemberId.make(generateUUID());
const projectId = () => ProjectId.make(generateUUID());
const taskId = () => TaskId.make(generateUUID());
const timerId = () => TimerId.make(generateUUID());
const timeEntryId = () => TimeEntryId.make(generateUUID());

const optionFromNullable = <T>(value: T | undefined) =>
  value === undefined ? Option.none<T>() : Option.some(value);

const makeTimeEntry = (overrides: Partial<TimeEntry> = {}) =>
  TimeEntry.make({
    id: timeEntryId(),
    workspaceId: workspaceId(),
    workspaceMemberId: workspaceMemberId(),
    projectId: projectId(),
    taskId: Option.none(),
    startedAt,
    stoppedAt,
    notes: Option.none(),
    ...overrides,
  });

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

const makeRepositoryLayer = (params: {
  readonly timeEntry?: TimeEntry | undefined;
  readonly currentTimer?: Timer | undefined;
}) =>
  Layer.succeed(TrackedTimeRepository, {
    insertTimeEntries: Effect.succeed,
    updateTimeEntry: ({ data }) =>
      params.timeEntry
        ? Effect.succeed(
            TimeEntry.make({
              ...params.timeEntry,
              ...data,
            })
          )
        : Effect.die("missing Time Entry fixture"),
    hardDeleteMany: () => Effect.void,
    findTimeEntry: () => Effect.succeed(optionFromNullable(params.timeEntry)),
    findCurrentTimer: () =>
      Effect.succeed(optionFromNullable(params.currentTimer)),
    insertCurrentTimer: (timer) => Effect.succeed(timer),
    updateCurrentTimer: () => Effect.succeed(Option.none()),
    completeCurrentTimer: () => Effect.succeed(Option.none()),
  });

const makeTargetValidatorLayer = (params: {
  readonly projects: ReadonlySet<ProjectId>;
  readonly tasks: ReadonlyMap<TaskId, ProjectId>;
}) =>
  Layer.succeed(TrackedTimeTargetValidator, {
    validate: ({
      workspaceId: targetWorkspaceId,
      projectId: targetProjectId,
      taskId: targetTaskId,
    }) =>
      Effect.gen(function* () {
        if (!params.projects.has(targetProjectId)) {
          return yield* new TargetProjectNotFoundError({
            workspaceId: targetWorkspaceId,
            projectId: targetProjectId,
          });
        }

        if (Option.isNone(targetTaskId)) {
          return;
        }

        const taskProjectId = params.tasks.get(targetTaskId.value);

        if (!taskProjectId) {
          return yield* new TargetTaskNotFoundError({
            workspaceId: targetWorkspaceId,
            taskId: targetTaskId.value,
          });
        }

        if (taskProjectId !== targetProjectId) {
          return yield* new TargetTaskProjectMismatchError({
            workspaceId: targetWorkspaceId,
            projectId: targetProjectId,
            taskId: targetTaskId.value,
          });
        }
      }),
  });

const makeLayer = (params: {
  readonly timeEntry?: TimeEntry | undefined;
  readonly currentTimer?: Timer | undefined;
  readonly projects: ReadonlySet<ProjectId>;
  readonly tasks: ReadonlyMap<TaskId, ProjectId>;
}) =>
  TimeModuleLayer.pipe(
    Layer.provide(
      makeRepositoryLayer({
        timeEntry: params.timeEntry,
        currentTimer: params.currentTimer,
      })
    ),
    Layer.provide(
      makeTargetValidatorLayer({
        projects: params.projects,
        tasks: params.tasks,
      })
    )
  );

const runEither = <A, E>(effect: Effect.Effect<A, E, never>) =>
  Effect.runPromise(
    Effect.match(effect, {
      onFailure: (error) => ({ _tag: "Left" as const, left: error }),
      onSuccess: (value) => ({ _tag: "Right" as const, right: value }),
    })
  );

describe("Time Module target validation", () => {
  it("rejects creating a Time Entry for a missing Project", async () => {
    const missingProjectId = projectId();
    const layer = makeLayer({ projects: new Set(), tasks: new Map() });

    const effect = Effect.gen(function* () {
      const timeModule = yield* TimeModule;

      return yield* timeModule.createTimeEntries({
        workspaceId: workspaceId(),
        workspaceMemberId: workspaceMemberId(),
        data: [
          {
            id: Option.none(),
            projectId: missingProjectId,
            startedAt,
            stoppedAt,
          },
        ],
      });
    });
    const result = await runEither(effect.pipe(Effect.provide(layer)));

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(TargetProjectNotFoundError);
    }
  });

  it("rejects starting a Timer when the Task is missing", async () => {
    const existingProjectId = projectId();
    const missingTaskId = taskId();
    const layer = makeLayer({
      projects: new Set([existingProjectId]),
      tasks: new Map(),
    });

    const effect = Effect.gen(function* () {
      const timeModule = yield* TimeModule;

      return yield* timeModule.startTimer({
        workspaceId: workspaceId(),
        workspaceMemberId: workspaceMemberId(),
        data: {
          id: Option.none(),
          projectId: existingProjectId,
          taskId: Option.some(missingTaskId),
          startedAt,
        },
      });
    });
    const result = await runEither(effect.pipe(Effect.provide(layer)));

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(TargetTaskNotFoundError);
    }
  });

  it("validates a Time Entry Partial Update against the effective Project", async () => {
    const existingProjectId = projectId();
    const otherProjectId = projectId();
    const mismatchedTaskId = taskId();
    const timeEntry = makeTimeEntry({ projectId: existingProjectId });
    const layer = makeLayer({
      timeEntry,
      projects: new Set([existingProjectId, otherProjectId]),
      tasks: new Map([[mismatchedTaskId, otherProjectId]]),
    });

    const effect = Effect.gen(function* () {
      const timeModule = yield* TimeModule;

      return yield* timeModule.updateTimeEntry({
        workspaceId: timeEntry.workspaceId,
        id: timeEntry.id,
        data: {
          taskId: Option.some(mismatchedTaskId),
        },
      });
    });
    const result = await runEither(effect.pipe(Effect.provide(layer)));

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(TargetTaskProjectMismatchError);
    }
  });

  it("keeps current Timer checks before target validation", async () => {
    const existingProjectId = projectId();
    const timer = makeTimer({
      id: timerId(),
      workspaceId: workspaceId(),
      workspaceMemberId: workspaceMemberId(),
      projectId: existingProjectId,
      taskId: Option.none(),
      startedAt,
      notes: Option.none(),
    });
    const layer = makeLayer({
      currentTimer: timer,
      projects: new Set(),
      tasks: new Map(),
    });

    const effect = Effect.gen(function* () {
      const timeModule = yield* TimeModule;

      return yield* timeModule.startTimer({
        workspaceId: timer.workspaceId,
        workspaceMemberId: timer.workspaceMemberId,
        data: {
          id: Option.none(),
          projectId: existingProjectId,
        },
      });
    });
    const result = await runEither(effect.pipe(Effect.provide(layer)));

    expect(result._tag).toBe("Left");
    if (result._tag === "Left") {
      expect(result.left).toBeInstanceOf(TimerAlreadyRunningError);
    }
  });
});
