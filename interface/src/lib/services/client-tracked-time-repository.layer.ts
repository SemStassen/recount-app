import {
  TrackedTimeRecord,
  TrackedTimeRepository,
} from "@recount/core/modules/time";
import { RepositoryError } from "@recount/core/shared/repository";
import { and, eq, queryOnce } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

import {
  type TrackedTimeRecordCollectionInsert,
  type TrackedTimeRecordRow,
  toTrackedTimeRecordCollectionInsert,
  toTrackedTimeRecord,
} from "~/db/workspace/workspace-collection-codecs";

import {
  deleteCollectionItems,
  type ClientRepositoryCollection,
  toQueryableCollection,
  updateCollectionItem,
} from "./client-repository-collection";

type TrackedTimeRecordCollection = ClientRepositoryCollection<
  TrackedTimeRecordRow,
  TrackedTimeRecordCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientTrackedTimeRepositoryLayer(
  timeEntriesCollection: TrackedTimeRecordCollection
) {
  const queryableTimeEntriesCollection = toQueryableCollection<
    TrackedTimeRecordRow,
    TrackedTimeRecordCollectionInsert
  >(timeEntriesCollection);

  return Layer.succeed(TrackedTimeRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          const timeEntries = data.map(toTrackedTimeRecord);
          timeEntriesCollection.insert(
            timeEntries.map(toTrackedTimeRecordCollectionInsert)
          );

          return timeEntries;
        },
        catch: toRepositoryError,
      }),
    update: ({ workspaceId, id, update }) =>
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem<
            TrackedTimeRecordRow,
            TrackedTimeRecordCollectionInsert
          >(timeEntriesCollection, id, update);

          const timeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: queryableTimeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, id))
              .findOne()
          );

          if (!timeEntry || timeEntry.workspaceId !== workspaceId) {
            throw new Error(`Time entry ${id} was not found after local write`);
          }

          return toTrackedTimeRecord(timeEntry);
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
    findById: ({ workspaceId, id }) =>
      Effect.tryPromise({
        try: async () => {
          const timeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: queryableTimeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, id))
              .findOne()
          );

          if (!timeEntry || timeEntry.workspaceId !== workspaceId) {
            return Option.none<TrackedTimeRecord>();
          }

          return Option.some(toTrackedTimeRecord(timeEntry));
        },
        catch: toRepositoryError,
      }),
    findTimerRecordByWorkspaceMember: ({ workspaceId, workspaceMemberId }) =>
      Effect.tryPromise({
        try: async () => {
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
            return Option.none<TrackedTimeRecord>();
          }

          return Option.some(toTrackedTimeRecord(timeEntry));
        },
        catch: toRepositoryError,
      }),
    updateTimerRecordByWorkspaceMember: ({
      workspaceId,
      workspaceMemberId,
      update,
    }) =>
      Effect.tryPromise({
        try: async () => {
          const timerRecord = await queryOnce((q) =>
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
            !timerRecord ||
            timerRecord.workspaceId !== workspaceId ||
            Option.isSome(timerRecord.stoppedAt)
          ) {
            return Option.none<TrackedTimeRecord>();
          }

          updateCollectionItem<
            TrackedTimeRecordRow,
            TrackedTimeRecordCollectionInsert
          >(timeEntriesCollection, timerRecord.id, update);

          const updatedTimeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: queryableTimeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, timerRecord.id))
              .findOne()
          );

          if (!updatedTimeEntry) {
            return Option.none<TrackedTimeRecord>();
          }

          return Option.some(toTrackedTimeRecord(updatedTimeEntry));
        },
        catch: toRepositoryError,
      }),
  });
}
