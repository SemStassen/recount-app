import { DateTime, Effect, Layer, Option } from "effect";

import { isRunningTimeEntryRecord } from "./domain/time-entry-record";
import {
  recordFromRunningTimeEntry,
  recordFromStoppedTimeEntry,
  runningTimeEntryFromRecord,
  stoppedTimeEntryFromRecord,
} from "./domain/time-entry-record-mapping";
import { TimeEntry } from "./domain/time-entry.entity";
import {
  CannotUpdateRunningTimeEntryError,
  RunningTimeEntryNotFoundError,
  TimeEntryAlreadyRunningError,
} from "./domain/time-entry.errors";
import * as timeEntryTransitions from "./domain/time-entry.transitions";
import { TimeEntryRepository } from "./time-entry-repository.service";
import { TimeEntryNotFoundError, TimeModule } from "./time-module.service";

export const TimeModuleLayer = Layer.effect(
  TimeModule,
  Effect.gen(function* () {
    const timeEntryRepo = yield* TimeEntryRepository;

    const ensureNoOtherRunningTimeEntry = Effect.fn(
      "time.ensureNoOtherRunningTimeEntry"
    )(function* (params: {
      workspaceId: TimeEntry["workspaceId"];
      workspaceMemberId: TimeEntry["workspaceMemberId"];
      excludeTimeEntryId?: TimeEntry["id"];
    }) {
      const maybeRunningTimeEntry =
        yield* timeEntryRepo.findRunningByWorkspaceMember({
          workspaceId: params.workspaceId,
          workspaceMemberId: params.workspaceMemberId,
        });

      if (
        Option.isSome(maybeRunningTimeEntry) &&
        maybeRunningTimeEntry.value.id !== params.excludeTimeEntryId
      ) {
        return yield* new TimeEntryAlreadyRunningError();
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
              timeEntryTransitions.createStoppedTimeEntry({
                workspaceId: params.workspaceId,
                workspaceMemberId: params.workspaceMemberId,
                data,
                now,
              })
            )
          );

          const persistedTimeEntries = yield* timeEntryRepo.insertMany(
            timeEntries.map(recordFromStoppedTimeEntry)
          );

          return persistedTimeEntries.map(stoppedTimeEntryFromRecord);
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

        if (isRunningTimeEntryRecord(timeEntry)) {
          return yield* new CannotUpdateRunningTimeEntryError();
        }

        const { entity, changes } = yield* Effect.fromResult(
          timeEntryTransitions.updateTimeEntry({
            timeEntry: stoppedTimeEntryFromRecord(timeEntry),
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

        return stoppedTimeEntryFromRecord(persistedTimeEntry);
      }),
      startRunningTimeEntry: Effect.fn("time.startRunningTimeEntry")(
        function* (params) {
          const now = yield* DateTime.now;

          yield* ensureNoOtherRunningTimeEntry({
            workspaceId: params.workspaceId,
            workspaceMemberId: params.workspaceMemberId,
          });

          const timeEntry = yield* Effect.fromResult(
            timeEntryTransitions.startRunningTimeEntry({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
              data: params.data,
              now,
            })
          );

          const [persistedTimeEntry] = yield* timeEntryRepo.insertMany([
            recordFromRunningTimeEntry(timeEntry),
          ]);

          return runningTimeEntryFromRecord(persistedTimeEntry);
        }
      ),
      updateRunningTimeEntry: Effect.fn("time.updateRunningTimeEntry")(
        function* (params) {
          const maybeTimeEntry =
            yield* timeEntryRepo.findRunningByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
            });

          if (Option.isNone(maybeTimeEntry)) {
            return yield* new RunningTimeEntryNotFoundError();
          }

          const { changes } = yield* Effect.fromResult(
            timeEntryTransitions.updateRunningTimeEntry({
              timeEntry: runningTimeEntryFromRecord(maybeTimeEntry.value),
              data: params.data,
            })
          );

          const persistedTimeEntry =
            yield* timeEntryRepo.updateRunningByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
              update: changes,
            });

          if (Option.isNone(persistedTimeEntry)) {
            return yield* new RunningTimeEntryNotFoundError();
          }

          return runningTimeEntryFromRecord(persistedTimeEntry.value);
        }
      ),
      stopRunningTimeEntry: Effect.fn("time.stopRunningTimeEntry")(
        function* (params) {
          const now = yield* DateTime.now;
          const maybeTimeEntry =
            yield* timeEntryRepo.findRunningByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
            });

          if (Option.isNone(maybeTimeEntry)) {
            return yield* new RunningTimeEntryNotFoundError();
          }

          const { entity } = yield* Effect.fromResult(
            timeEntryTransitions.stopRunningTimeEntry({
              timeEntry: runningTimeEntryFromRecord(maybeTimeEntry.value),
              now,
            })
          );

          const persistedTimeEntry =
            yield* timeEntryRepo.updateRunningByWorkspaceMember({
              workspaceId: params.workspaceId,
              workspaceMemberId: params.workspaceMemberId,
              update: {
                stoppedAt: Option.some(entity.stoppedAt),
              },
            });

          if (Option.isNone(persistedTimeEntry)) {
            return yield* new RunningTimeEntryNotFoundError();
          }

          return stoppedTimeEntryFromRecord(persistedTimeEntry.value);
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
