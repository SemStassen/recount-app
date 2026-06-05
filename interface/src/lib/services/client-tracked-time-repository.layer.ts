import {
  CurrentTimerConflictError,
  timerFromTrackedTime,
  timeEntryFromTrackedTime,
  TrackedTime,
  trackedTimeFromTimeEntry,
  trackedTimeFromTimer,
  TrackedTimeRepository,
  trackedTimeUpdateFromTimeEntryChanges,
  trackedTimeUpdateFromTimerChanges,
} from "@recount/core/modules/time";
import { RepositoryError } from "@recount/core/shared/repository";
import { and, eq, queryOnce } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

import {
  type TrackedTimeCollectionInsert,
  type TrackedTimeRow,
  toTrackedTimeCollectionInsert,
  toTrackedTime,
} from "~/db/workspace/workspace-collection-codecs";

import {
  deleteCollectionItems,
  type ClientRepositoryCollection,
  toQueryableCollection,
  updateCollectionItem,
} from "./client-repository-collection";

type TrackedTimeCollection = ClientRepositoryCollection<
  TrackedTimeRow,
  TrackedTimeCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientTrackedTimeRepositoryLayer(
  timeEntriesCollection: TrackedTimeCollection
) {
  const queryableTimeEntriesCollection = toQueryableCollection<
    TrackedTimeRow,
    TrackedTimeCollectionInsert
  >(timeEntriesCollection);

  const findCurrentTrackedTime = async ({
    workspaceId,
    workspaceMemberId,
  }: {
    workspaceId: TrackedTime["workspaceId"];
    workspaceMemberId: TrackedTime["workspaceMemberId"];
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
      return Option.none<TrackedTime>();
    }

    return Option.some(toTrackedTime(timeEntry));
  };

  return Layer.succeed(TrackedTimeRepository, {
    insertTimeEntries: (timeEntries) =>
      Effect.try({
        try: () => {
          const trackedTimes = timeEntries.map(trackedTimeFromTimeEntry);
          timeEntriesCollection.insert(
            trackedTimes.map(toTrackedTimeCollectionInsert)
          );

          return trackedTimes.map(timeEntryFromTrackedTime);
        },
        catch: toRepositoryError,
      }),
    updateTimeEntry: ({ workspaceId, id, data }) =>
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem<TrackedTimeRow, TrackedTimeCollectionInsert>(
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

          return timeEntryFromTrackedTime(toTrackedTime(timeEntry));
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
            timeEntryFromTrackedTime(toTrackedTime(timeEntry))
          );
        },
        catch: toRepositoryError,
      }),
    findCurrentTimer: (params) =>
      Effect.tryPromise({
        try: async () =>
          Option.map(
            await findCurrentTrackedTime(params),
            timerFromTrackedTime
          ),
        catch: toRepositoryError,
      }),
    insertCurrentTimer: (timer) =>
      Effect.tryPromise({
        try: async () => {
          const currentTimer = await findCurrentTrackedTime({
            workspaceId: timer.workspaceId,
            workspaceMemberId: timer.workspaceMemberId,
          });

          if (Option.isSome(currentTimer)) {
            throw new CurrentTimerConflictError({
              workspaceId: timer.workspaceId,
              workspaceMemberId: timer.workspaceMemberId,
            });
          }

          const trackedTime = trackedTimeFromTimer(timer);
          timeEntriesCollection.insert([
            toTrackedTimeCollectionInsert(trackedTime),
          ]);

          return timerFromTrackedTime(trackedTime);
        },
        catch: (cause) =>
          cause instanceof CurrentTimerConflictError
            ? cause
            : toRepositoryError(cause),
      }),
    updateCurrentTimer: ({ workspaceId, workspaceMemberId, data }) =>
      Effect.tryPromise({
        try: async () => {
          const currentTimer = await findCurrentTrackedTime({
            workspaceId,
            workspaceMemberId,
          });

          if (Option.isNone(currentTimer)) {
            return Option.none();
          }

          updateCollectionItem<TrackedTimeRow, TrackedTimeCollectionInsert>(
            timeEntriesCollection,
            currentTimer.value.id,
            trackedTimeUpdateFromTimerChanges(data)
          );

          const updatedTimer = await findCurrentTrackedTime({
            workspaceId,
            workspaceMemberId,
          });

          return Option.map(updatedTimer, timerFromTrackedTime);
        },
        catch: toRepositoryError,
      }),
    completeCurrentTimer: ({ workspaceId, workspaceMemberId, timeEntry }) =>
      Effect.tryPromise({
        try: async () => {
          const currentTimer = await findCurrentTrackedTime({
            workspaceId,
            workspaceMemberId,
          });

          if (Option.isNone(currentTimer)) {
            return Option.none();
          }

          updateCollectionItem<TrackedTimeRow, TrackedTimeCollectionInsert>(
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
            timeEntryFromTrackedTime(toTrackedTime(completedTimeEntry))
          );
        },
        catch: toRepositoryError,
      }),
  });
}
