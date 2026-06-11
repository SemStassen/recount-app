import { TimerAlreadyRunningError } from "@recount/core/modules/time";
import type { TrackedTimeRow } from "@recount/core/modules/time/persistence";
import {
  timerFromTrackedTimeRow,
  timeEntryFromTrackedTimeRow,
  TrackedTimeRepository,
  trackedTimeRowFromTimeEntry,
  trackedTimeRowFromTimer,
  trackedTimeUpdateFromTimeEntryChanges,
} from "@recount/core/modules/time/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { Effect, Layer, Option, Result } from "effect";

import type {
  TrackedTimeCollectionInsert,
  TrackedTimeCollectionRow,
} from "~/db/synced-collections";
import {
  toTrackedTimeCollectionInsert,
  toTrackedTimeCollectionPatch,
  toTrackedTimeRow,
} from "~/db/synced-collections";

import type { ClientRepositoryCollection } from "./client-repository-collection";
import {
  deleteCollectionItems,
  updateCollectionItem,
} from "./client-repository-collection";

type TrackedTimeCollection = ClientRepositoryCollection<
  TrackedTimeCollectionRow,
  TrackedTimeCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientTrackedTimeRepositoryLayer(
  timeEntriesCollection: TrackedTimeCollection
) {
  const findCurrentTrackedTimeRow = ({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: TrackedTimeRow["workspaceId"];
    workspaceMemberId: TrackedTimeRow["workspaceMemberId"];
  }) => {
    for (const timeEntry of timeEntriesCollection.values()) {
      if (
        timeEntry.workspaceId === workspaceId &&
        timeEntry.workspaceMemberId === workspaceMemberId &&
        timeEntry.stoppedAt === null
      ) {
        return Option.some(toTrackedTimeRow(timeEntry));
      }
    }

    return Option.none<TrackedTimeRow>();
  };

  return Layer.succeed(TrackedTimeRepository, {
    completeCurrentTimer: ({ workspaceId, workspaceMemberId, timeEntry }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          const currentTimer = findCurrentTrackedTimeRow({
            workspaceId,
            workspaceMemberId,
          });

          if (Option.isNone(currentTimer)) {
            return Option.none();
          }

          updateCollectionItem<
            TrackedTimeCollectionRow,
            TrackedTimeCollectionInsert
          >(
            timeEntriesCollection,
            currentTimer.value.id,
            toTrackedTimeCollectionPatch(
              trackedTimeUpdateFromTimeEntryChanges({
                stoppedAt: timeEntry.stoppedAt,
              })
            )
          );

          const completedTimeEntry = timeEntriesCollection.get(
            currentTimer.value.id
          );

          if (!completedTimeEntry || completedTimeEntry.stoppedAt === null) {
            return Option.none();
          }

          return Option.some(
            Result.getOrThrow(
              timeEntryFromTrackedTimeRow(toTrackedTimeRow(completedTimeEntry))
            )
          );
        },
      }),
    findCurrentTimer: (params) =>
      Effect.try({
        catch: toRepositoryError,
        try: () =>
          Option.map(findCurrentTrackedTimeRow(params), (trackedTimeRow) =>
            Result.getOrThrow(timerFromTrackedTimeRow(trackedTimeRow))
          ),
      }),
    findTimeEntry: ({ workspaceId, id }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          const timeEntry = timeEntriesCollection.get(id);

          if (
            !timeEntry ||
            timeEntry.workspaceId !== workspaceId ||
            timeEntry.stoppedAt === null
          ) {
            return Option.none();
          }

          return Option.some(
            Result.getOrThrow(
              timeEntryFromTrackedTimeRow(toTrackedTimeRow(timeEntry))
            )
          );
        },
      }),
    hardDeleteMany: ({ ids }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          deleteCollectionItems(timeEntriesCollection, ids);
        },
      }),
    insertCurrentTimer: (timer) =>
      Effect.try({
        catch: (cause) =>
          cause instanceof TimerAlreadyRunningError
            ? cause
            : toRepositoryError(cause),
        try: () => {
          const currentTimer = findCurrentTrackedTimeRow({
            workspaceId: timer.workspaceId,
            workspaceMemberId: timer.workspaceMemberId,
          });

          if (Option.isSome(currentTimer)) {
            throw new TimerAlreadyRunningError({
              workspaceId: timer.workspaceId,
              workspaceMemberId: timer.workspaceMemberId,
            });
          }

          const trackedTimeRow = trackedTimeRowFromTimer(timer);
          timeEntriesCollection.insert([
            toTrackedTimeCollectionInsert(trackedTimeRow),
          ]);

          return Result.getOrThrow(timerFromTrackedTimeRow(trackedTimeRow));
        },
      }),
    insertTimeEntries: (timeEntries) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          const trackedTimeRows = timeEntries.map(trackedTimeRowFromTimeEntry);
          timeEntriesCollection.insert(
            trackedTimeRows.map(toTrackedTimeCollectionInsert)
          );

          return trackedTimeRows.map((trackedTimeRow) =>
            Result.getOrThrow(timeEntryFromTrackedTimeRow(trackedTimeRow))
          );
        },
      }),
    updateCurrentTimer: ({ workspaceId, workspaceMemberId, data }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          const currentTimer = findCurrentTrackedTimeRow({
            workspaceId,
            workspaceMemberId,
          });

          if (Option.isNone(currentTimer)) {
            return Option.none();
          }

          updateCollectionItem<
            TrackedTimeCollectionRow,
            TrackedTimeCollectionInsert
          >(
            timeEntriesCollection,
            currentTimer.value.id,
            toTrackedTimeCollectionPatch(data)
          );

          const updatedTimer = findCurrentTrackedTimeRow({
            workspaceId,
            workspaceMemberId,
          });

          return Option.map(updatedTimer, (trackedTimeRow) =>
            Result.getOrThrow(timerFromTrackedTimeRow(trackedTimeRow))
          );
        },
      }),
    updateTimeEntry: ({ workspaceId, id, data }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          updateCollectionItem<
            TrackedTimeCollectionRow,
            TrackedTimeCollectionInsert
          >(
            timeEntriesCollection,
            id,
            toTrackedTimeCollectionPatch(
              trackedTimeUpdateFromTimeEntryChanges(data)
            )
          );

          const timeEntry = timeEntriesCollection.get(id);

          if (
            !timeEntry ||
            timeEntry.workspaceId !== workspaceId ||
            timeEntry.stoppedAt === null
          ) {
            throw new Error(`Time entry ${id} was not found after local write`);
          }

          return Result.getOrThrow(
            timeEntryFromTrackedTimeRow(toTrackedTimeRow(timeEntry))
          );
        },
      }),
  });
}
