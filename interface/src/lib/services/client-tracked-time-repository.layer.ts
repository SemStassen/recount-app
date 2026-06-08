import { TimerAlreadyRunningError } from "@recount/core/modules/time";
import {
  timerFromTrackedTimeRow,
  timeEntryFromTrackedTimeRow,
  TrackedTimeRepository,
  TrackedTimeRow,
  trackedTimeRowFromTimeEntry,
  trackedTimeRowFromTimer,
  trackedTimeUpdateFromTimeEntryChanges,
} from "@recount/core/modules/time/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { Effect, Layer, Option, Result } from "effect";

import {
  type TrackedTimeCollectionInsert,
  type TrackedTimeCollectionRow,
  toTrackedTimeCollectionInsert,
  toTrackedTimeRow,
} from "~/db/workspace/workspace-collection-codecs";

import {
  deleteCollectionItems,
  type ClientRepositoryCollection,
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
        Option.isNone(timeEntry.stoppedAt)
      ) {
        return Option.some(toTrackedTimeRow(timeEntry));
      }
    }

    return Option.none<TrackedTimeRow>();
  };

  return Layer.succeed(TrackedTimeRepository, {
    insertTimeEntries: (timeEntries) =>
      Effect.try({
        try: () => {
          const trackedTimeRows = timeEntries.map(trackedTimeRowFromTimeEntry);
          timeEntriesCollection.insert(
            trackedTimeRows.map(toTrackedTimeCollectionInsert)
          );

          return trackedTimeRows.map((trackedTimeRow) =>
            Result.getOrThrow(timeEntryFromTrackedTimeRow(trackedTimeRow))
          );
        },
        catch: toRepositoryError,
      }),
    updateTimeEntry: ({ workspaceId, id, data }) =>
      Effect.try({
        try: () => {
          updateCollectionItem<
            TrackedTimeCollectionRow,
            TrackedTimeCollectionInsert
          >(
            timeEntriesCollection,
            id,
            trackedTimeUpdateFromTimeEntryChanges(data)
          );

          const timeEntry = timeEntriesCollection.get(id);

          if (
            !timeEntry ||
            timeEntry.workspaceId !== workspaceId ||
            Option.isNone(timeEntry.stoppedAt)
          ) {
            throw new Error(`Time entry ${id} was not found after local write`);
          }

          return Result.getOrThrow(
            timeEntryFromTrackedTimeRow(toTrackedTimeRow(timeEntry))
          );
        },
        catch: toRepositoryError,
      }),
    hardDeleteMany: ({ ids }) =>
      Effect.try({
        try: () => {
          deleteCollectionItems(timeEntriesCollection, ids);
        },
        catch: toRepositoryError,
      }),
    findTimeEntry: ({ workspaceId, id }) =>
      Effect.try({
        try: () => {
          const timeEntry = timeEntriesCollection.get(id);

          if (
            !timeEntry ||
            timeEntry.workspaceId !== workspaceId ||
            Option.isNone(timeEntry.stoppedAt)
          ) {
            return Option.none();
          }

          return Option.some(
            Result.getOrThrow(
              timeEntryFromTrackedTimeRow(toTrackedTimeRow(timeEntry))
            )
          );
        },
        catch: toRepositoryError,
      }),
    findCurrentTimer: (params) =>
      Effect.try({
        try: () =>
          Option.map(findCurrentTrackedTimeRow(params), (trackedTimeRow) =>
            Result.getOrThrow(timerFromTrackedTimeRow(trackedTimeRow))
          ),
        catch: toRepositoryError,
      }),
    insertCurrentTimer: (timer) =>
      Effect.try({
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
        catch: (cause) =>
          cause instanceof TimerAlreadyRunningError
            ? cause
            : toRepositoryError(cause),
      }),
    updateCurrentTimer: ({ workspaceId, workspaceMemberId, data }) =>
      Effect.try({
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
          >(timeEntriesCollection, currentTimer.value.id, data);

          const updatedTimer = findCurrentTrackedTimeRow({
            workspaceId,
            workspaceMemberId,
          });

          return Option.map(updatedTimer, (trackedTimeRow) =>
            Result.getOrThrow(timerFromTrackedTimeRow(trackedTimeRow))
          );
        },
        catch: toRepositoryError,
      }),
    completeCurrentTimer: ({ workspaceId, workspaceMemberId, timeEntry }) =>
      Effect.try({
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
            trackedTimeUpdateFromTimeEntryChanges({
              stoppedAt: timeEntry.stoppedAt,
            })
          );

          const completedTimeEntry = timeEntriesCollection.get(
            currentTimer.value.id
          );

          if (
            !completedTimeEntry ||
            Option.isNone(completedTimeEntry.stoppedAt)
          ) {
            return Option.none();
          }

          return Option.some(
            Result.getOrThrow(
              timeEntryFromTrackedTimeRow(toTrackedTimeRow(completedTimeEntry))
            )
          );
        },
        catch: toRepositoryError,
      }),
  });
}
