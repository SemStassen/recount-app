import { DateTime, Effect, Layer, Option } from "effect";

import { Timer, TimeEntry } from "./domain/time-entry.entity";
import {
  CannotUpdateTimerError,
  TimerNotFoundError,
  TimerAlreadyRunningError,
} from "./domain/time-entry.errors";
import * as timeEntryTransitions from "./domain/time-entry.transitions";
import {
  recordFromTimer,
  recordFromTimeEntry,
  recordUpdateFromTimeEntryChanges,
  recordUpdateFromTimerChanges,
  timerFromRecord,
  timeEntryFromRecord,
  trackedTimeFromRecord,
} from "./domain/tracked-time-record-mapping";
import { TimeEntryNotFoundError, TimeModule } from "./time-module.service";
import { TrackedTimeRepository } from "./tracked-time-repository.service";

export const TimeModuleLayer = Layer.effect(
  TimeModule,
  Effect.gen(function* () {
    const trackedTimeRecordRepo = yield* TrackedTimeRepository;

    const ensureNoOtherTimer = Effect.fn("time.ensureNoOtherTimer")(
      function* (params: {
        workspaceId: TimeEntry["workspaceId"];
        workspaceMemberId: TimeEntry["workspaceMemberId"];
        excludeTimeEntryId?: TimeEntry["id"];
      }) {
        const maybeTimer =
          yield* trackedTimeRecordRepo.findTimerRecordByWorkspaceMember({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });

        if (
          Option.isSome(maybeTimer) &&
          maybeTimer.value.id !== params.excludeTimeEntryId
        ) {
          return yield* new TimerAlreadyRunningError();
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

          const persistedTimeEntries = yield* trackedTimeRecordRepo.insertMany(
            timeEntries.map(recordFromTimeEntry)
          );

          return persistedTimeEntries.map(timeEntryFromRecord);
        }
      ),
      updateTimeEntry: Effect.fn("time.updateTimeEntry")(function* (params) {
        const trackedTimeRecord = yield* trackedTimeRecordRepo
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

        const timeEntry = trackedTimeFromRecord(trackedTimeRecord);

        if (timeEntry instanceof Timer) {
          return yield* new CannotUpdateTimerError();
        }

        const { entity, changes } = yield* Effect.fromResult(
          timeEntryTransitions.updateTimeEntry({
            timeEntry,
            data: params.data,
          })
        );

        const persistedTimeEntry = yield* trackedTimeRecordRepo.update({
          id: entity.id,
          workspaceId: entity.workspaceId,
          update: recordUpdateFromTimeEntryChanges(changes),
        });

        return timeEntryFromRecord(persistedTimeEntry);
      }),
      startTimer: Effect.fn("time.startTimer")(function* (params) {
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

        const [persistedTimeEntry] = yield* trackedTimeRecordRepo.insertMany([
          recordFromTimer(timeEntry),
        ]);

        return timerFromRecord(persistedTimeEntry);
      }),
      updateTimer: Effect.fn("time.updateTimer")(function* (params) {
        const maybeTimeEntry =
          yield* trackedTimeRecordRepo.findTimerRecordByWorkspaceMember({
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
          yield* trackedTimeRecordRepo.updateTimerRecordByWorkspaceMember({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
            update: recordUpdateFromTimerChanges(changes),
          });

        if (Option.isNone(persistedTimeEntry)) {
          return yield* new TimerNotFoundError();
        }

        return timerFromRecord(persistedTimeEntry.value);
      }),
      stopTimer: Effect.fn("time.stopTimer")(function* (params) {
        const now = yield* DateTime.now;
        const maybeTimeEntry =
          yield* trackedTimeRecordRepo.findTimerRecordByWorkspaceMember({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });

        if (Option.isNone(maybeTimeEntry)) {
          return yield* new TimerNotFoundError();
        }

        const { changes } = yield* Effect.fromResult(
          timeEntryTransitions.stopTimer({
            timer: timerFromRecord(maybeTimeEntry.value),
            now,
          })
        );

        const persistedTimeEntry =
          yield* trackedTimeRecordRepo.updateTimerRecordByWorkspaceMember({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
            update: recordUpdateFromTimeEntryChanges(changes),
          });

        if (Option.isNone(persistedTimeEntry)) {
          return yield* new TimerNotFoundError();
        }

        return timeEntryFromRecord(persistedTimeEntry.value);
      }),
      hardDeleteTimeEntries: Effect.fn("time.hardDeleteTimeEntries")(
        function* (params) {
          if (params.ids.length === 0) {
            return;
          }

          yield* trackedTimeRecordRepo.hardDeleteMany({
            workspaceId: params.workspaceId,
            ids: params.ids,
          });
        }
      ),
    };
  })
);
