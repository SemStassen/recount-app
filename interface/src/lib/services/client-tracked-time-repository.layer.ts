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
import { and, eq, queryOnce } from "@tanstack/react-db";
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
  toQueryableCollection,
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
  const queryableTimeEntriesCollection = toQueryableCollection<
    TrackedTimeCollectionRow,
    TrackedTimeCollectionInsert
  >(timeEntriesCollection);

  const findCurrentTrackedTimeRow = async ({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: TrackedTimeRow["workspaceId"];
    workspaceMemberId: TrackedTimeRow["workspaceMemberId"];
  }) => {
    const timeEntry = await queryOnce((q) =>
      q
        .from({ timeEntry: queryableTimeEntriesCollection })
        .where(({ timeEntry }) =>
          and(
            eq(timeEntry.workspaceMemberId, workspaceMemberId),
            eq(timeEntry.stoppedAt, Option.none())
          )
        )
        .findOne()
    );

    if (
      !timeEntry ||
      timeEntry.workspaceId !== workspaceId ||
      Option.isSome(timeEntry.stoppedAt)
    ) {
      return Option.none<TrackedTimeRow>();
    }

    return Option.some(toTrackedTimeRow(timeEntry));
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
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem<
            TrackedTimeCollectionRow,
            TrackedTimeCollectionInsert
          >(
            timeEntriesCollection,
            id,
            trackedTimeUpdateFromTimeEntryChanges(data)
          );

          const timeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: queryableTimeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, id))
              .findOne()
          );

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
      Effect.tryPromise({
        try: async () => {
          const timeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: queryableTimeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, id))
              .findOne()
          );

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
      Effect.tryPromise({
        try: async () =>
          Option.map(
            await findCurrentTrackedTimeRow(params),
            (trackedTimeRow) =>
              Result.getOrThrow(timerFromTrackedTimeRow(trackedTimeRow))
          ),
        catch: toRepositoryError,
      }),
    insertCurrentTimer: (timer) =>
      Effect.tryPromise({
        try: async () => {
          const currentTimer = await findCurrentTrackedTimeRow({
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
      Effect.tryPromise({
        try: async () => {
          const currentTimer = await findCurrentTrackedTimeRow({
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

          const updatedTimer = await findCurrentTrackedTimeRow({
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
      Effect.tryPromise({
        try: async () => {
          const currentTimer = await findCurrentTrackedTimeRow({
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

          const completedTimeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: queryableTimeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, currentTimer.value.id))
              .findOne()
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
