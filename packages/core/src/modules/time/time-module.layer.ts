import { DateTime, Effect, Layer, Option } from "effect";

import type { Timer } from "./domain/tracked-time.entity";
import {
  TimerNotFoundError,
  TimerAlreadyRunningError,
} from "./domain/tracked-time.errors";
import * as timeEntryTransitions from "./domain/tracked-time.transitions";
import { TrackedTimeRepository } from "./persistence";
import { TrackedTimeTargetValidator } from "./ports";
import { TimeEntryNotFoundError, TimeModule } from "./time-module.service";

export const TimeModuleLayer = Layer.effect(
  TimeModule,
  Effect.gen(function* () {
    const trackedTimeRepo = yield* TrackedTimeRepository;
    const trackedTimeTargetValidator = yield* TrackedTimeTargetValidator;

    const ensureNoCurrentTimer = Effect.fn("time.ensureNoCurrentTimer")(
      function* (params: {
        workspaceId: Timer["workspaceId"];
        workspaceMemberId: Timer["workspaceMemberId"];
      }) {
        const maybeCurrentTimer = yield* trackedTimeRepo.findCurrentTimer({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
        });

        if (Option.isSome(maybeCurrentTimer)) {
          return yield* new TimerAlreadyRunningError({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });
        }
      }
    );

    return {
      createTimeEntries: Effect.fn("time.createTimeEntries")(
        function* (params) {
          if (params.data.length === 0) {
            return [];
          }

          const now = yield* DateTime.now;

          const timeEntries = yield* Effect.forEach(params.data, (data) =>
            Effect.fromResult(
              timeEntryTransitions.createTimeEntry({
                workspaceId: params.workspaceId,
                workspaceMemberId: params.workspaceMemberId,
                data,
                now,
              })
            )
          );

          yield* Effect.forEach(timeEntries, (timeEntry) =>
            trackedTimeTargetValidator.validate({
              workspaceId: timeEntry.workspaceId,
              projectId: timeEntry.projectId,
              taskId: timeEntry.taskId,
            })
          );

          return yield* trackedTimeRepo.insertTimeEntries(timeEntries);
        }
      ),
      updateTimeEntry: Effect.fn("time.updateTimeEntry")(function* (params) {
        const timeEntry = yield* trackedTimeRepo
          .findTimeEntry({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new TimeEntryNotFoundError({
                      workspaceId: params.workspaceId,
                      timeEntryId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        const { entity, changes } = yield* Effect.fromResult(
          timeEntryTransitions.updateTimeEntry({
            timeEntry,
            data: params.data,
          })
        );

        yield* trackedTimeTargetValidator.validate({
          workspaceId: entity.workspaceId,
          projectId: entity.projectId,
          taskId: entity.taskId,
        });

        return yield* trackedTimeRepo.updateTimeEntry({
          id: timeEntry.id,
          workspaceId: timeEntry.workspaceId,
          data: changes,
        });
      }),
      startTimer: Effect.fn("time.startTimer")(function* (params) {
        const startedAt = params.data.startedAt ?? (yield* DateTime.now);

        yield* ensureNoCurrentTimer({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
        });

        const timer = yield* Effect.fromResult(
          timeEntryTransitions.startTimer({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
            data: params.data,
            now: startedAt,
          })
        );

        yield* trackedTimeTargetValidator.validate({
          workspaceId: timer.workspaceId,
          projectId: timer.projectId,
          taskId: timer.taskId,
        });

        return yield* trackedTimeRepo.insertCurrentTimer(timer);
      }),
      updateTimer: Effect.fn("time.updateTimer")(function* (params) {
        const currentTimer = yield* trackedTimeRepo.findCurrentTimer({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
        });

        if (Option.isNone(currentTimer)) {
          return yield* new TimerNotFoundError({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });
        }

        const { entity, changes } = yield* Effect.fromResult(
          timeEntryTransitions.updateTimer({
            timer: currentTimer.value,
            data: params.data,
          })
        );

        yield* trackedTimeTargetValidator.validate({
          workspaceId: entity.workspaceId,
          projectId: entity.projectId,
          taskId: entity.taskId,
        });

        const persistedTimer = yield* trackedTimeRepo.updateCurrentTimer({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
          data: changes,
        });

        if (Option.isNone(persistedTimer)) {
          return yield* new TimerNotFoundError({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });
        }

        return persistedTimer.value;
      }),
      stopTimer: Effect.fn("time.stopTimer")(function* (params) {
        const stoppedAt = params.data.stoppedAt ?? (yield* DateTime.now);
        const currentTimer = yield* trackedTimeRepo.findCurrentTimer({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
        });

        if (Option.isNone(currentTimer)) {
          return yield* new TimerNotFoundError({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });
        }

        const { entity } = yield* Effect.fromResult(
          timeEntryTransitions.stopTimer({
            timer: currentTimer.value,
            now: stoppedAt,
          })
        );

        const persistedTimeEntry = yield* trackedTimeRepo.completeCurrentTimer({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
          timeEntry: entity,
        });

        if (Option.isNone(persistedTimeEntry)) {
          return yield* new TimerNotFoundError({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });
        }

        return persistedTimeEntry.value;
      }),
      hardDeleteTimeEntries: Effect.fn("time.hardDeleteTimeEntries")(
        function* (params) {
          if (params.ids.length === 0) {
            return;
          }

          yield* trackedTimeRepo.hardDeleteMany({
            workspaceId: params.workspaceId,
            ids: params.ids,
          });
        }
      ),
    };
  })
);
