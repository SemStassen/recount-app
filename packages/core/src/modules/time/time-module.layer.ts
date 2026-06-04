import { DateTime, Effect, Layer, Option } from "effect";

import {
  recordFromTimer,
  recordFromTimeEntry,
  timerFromRecord,
  timeEntryFromRecord,
} from "./domain/time-entry-record-mapping";
import { TimeEntry } from "./domain/time-entry.entity";
import {
  CannotUpdateTimerError,
  TimerNotFoundError,
  TimerAlreadyRunningError,
} from "./domain/time-entry.errors";
import { isTimerRecord } from "./domain/time-entry.record";
import * as timeEntryTransitions from "./domain/time-entry.transitions";
import { TimeEntryRepository } from "./time-entry-repository.service";
import { TimeEntryNotFoundError, TimeModule } from "./time-module.service";

export const TimeModuleLayer = Layer.effect(
  TimeModule,
  Effect.gen(function* () {
    const timeEntryRepo = yield* TimeEntryRepository;

    const ensureNoOtherTimer = Effect.fn(
      "time.ensureNoOtherTimer"
    )(function* (params: {
      workspaceId: TimeEntry["workspaceId"];
      workspaceMemberId: TimeEntry["workspaceMemberId"];
      excludeTimeEntryId?: TimeEntry["id"];
    }) {
      const maybeTimer =
        yield* timeEntryRepo.findTimerRecordByWorkspaceMember({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
        });

      if (
        Option.isSome(maybeTimer) &&
        maybeTimer.value.id !== params.excludeTimeEntryId
      ) {
        return yield* new TimerAlreadyRunningError();
      }
    });

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

          const persistedTimeEntries = yield* timeEntryRepo.insertMany(
            timeEntries.map(recordFromTimeEntry)
          );

          return persistedTimeEntries.map(timeEntryFromRecord);
        }
      ),
      updateTimeEntry: Effect.fn("time.updateTimeEntry")(function* (params) {
        const timeEntry = yield* timeEntryRepo
          .findById({ workspaceId: params.workspaceId, id: params.id })
          .pipe(
            Effect.flatMap(
              Option.match({
                onNone: () =>
                  Effect.fail(
                    new TimeEntryNotFoundError({
                      timeEntryId: params.id,
                    })
                  ),
                onSome: Effect.succeed,
              })
            )
          );

        if (isTimerRecord(timeEntry)) {
          return yield* new CannotUpdateTimerError();
        }

        const { entity, changes } = yield* Effect.fromResult(
          timeEntryTransitions.updateTimeEntry({
            timeEntry: timeEntryFromRecord(timeEntry),
            data: params.data,
          })
        );

        const { stoppedAt, ...otherChanges } = changes;
        const update =
          stoppedAt === undefined
            ? otherChanges
            : {
                ...otherChanges,
                stoppedAt: Option.some(stoppedAt),
              };

        const persistedTimeEntry = yield* timeEntryRepo.update({
          id: entity.id,
          workspaceId: entity.workspaceId,
          update,
        });

        return timeEntryFromRecord(persistedTimeEntry);
      }),
      startTimer: Effect.fn("time.startTimer")(
        function* (params) {
          const now = yield* DateTime.now;

          yield* ensureNoOtherTimer({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });

          const timeEntry = yield* Effect.fromResult(
            timeEntryTransitions.startTimer({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
              data: params.data,
              now,
            })
          );

          const [persistedTimeEntry] = yield* timeEntryRepo.insertMany([
            recordFromTimer(timeEntry),
          ]);

          return timerFromRecord(persistedTimeEntry);
        }
      ),
      updateTimer: Effect.fn("time.updateTimer")(
        function* (params) {
          const maybeTimeEntry =
            yield* timeEntryRepo.findTimerRecordByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
            });

          if (Option.isNone(maybeTimeEntry)) {
            return yield* new TimerNotFoundError();
          }

          const { changes } = yield* Effect.fromResult(
            timeEntryTransitions.updateTimer({
              timer: timerFromRecord(maybeTimeEntry.value),
              data: params.data,
            })
          );

          const persistedTimeEntry =
            yield* timeEntryRepo.updateTimerRecordByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
              update: changes,
            });

          if (Option.isNone(persistedTimeEntry)) {
            return yield* new TimerNotFoundError();
          }

          return timerFromRecord(persistedTimeEntry.value);
        }
      ),
      stopTimer: Effect.fn("time.stopTimer")(
        function* (params) {
          const now = yield* DateTime.now;
          const maybeTimeEntry =
            yield* timeEntryRepo.findTimerRecordByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
            });

          if (Option.isNone(maybeTimeEntry)) {
            return yield* new TimerNotFoundError();
          }

          const { entity } = yield* Effect.fromResult(
            timeEntryTransitions.stopTimer({
              timer: timerFromRecord(maybeTimeEntry.value),
              now,
            })
          );

          const persistedTimeEntry =
            yield* timeEntryRepo.updateTimerRecordByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
              update: {
                stoppedAt: Option.some(entity.stoppedAt),
              },
            });

          if (Option.isNone(persistedTimeEntry)) {
            return yield* new TimerNotFoundError();
          }

          return timeEntryFromRecord(persistedTimeEntry.value);
        }
      ),
      hardDeleteTimeEntries: Effect.fn("time.hardDeleteTimeEntries")(
        function* (params) {
          if (params.ids.length === 0) {
            return;
          }

          yield* timeEntryRepo.hardDeleteMany({
            workspaceId: params.workspaceId,
            ids: params.ids,
          });
        }
      ),
    };
  })
);
