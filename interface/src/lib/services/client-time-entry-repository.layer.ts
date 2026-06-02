import { TimeEntry, TimeEntryRepository } from "@recount/core/modules/time";
import { RepositoryError } from "@recount/core/shared/repository";
import { and, eq, queryOnce } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

import {
  type TimeEntryCollectionInsert,
  type TimeEntryRow,
  toTimeEntryCollectionInsert,
  toTimeEntryEntity,
} from "~/db/workspace/workspace-collection-codecs";

import {
  deleteCollectionItems,
  type ClientRepositoryCollection,
  toQueryableCollection,
  updateCollectionItem,
} from "./client-repository-collection";

type TimeEntryCollection = ClientRepositoryCollection<
  TimeEntryRow,
  TimeEntryCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientTimeEntryRepositoryLayer(
  timeEntriesCollection: TimeEntryCollection
) {
  const queryableTimeEntriesCollection = toQueryableCollection<
    TimeEntryRow,
    TimeEntryCollectionInsert
  >(timeEntriesCollection);

  return Layer.succeed(TimeEntryRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          const timeEntries = data.map(toTimeEntryEntity);
          timeEntriesCollection.insert(
            timeEntries.map(toTimeEntryCollectionInsert)
          );

          return timeEntries;
        },
        catch: toRepositoryError,
      }),
    update: ({ workspaceId, id, update }) =>
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem<TimeEntryRow, TimeEntryCollectionInsert>(
            timeEntriesCollection,
            id,
            update
          );

          const timeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: queryableTimeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, id))
              .findOne()
          );

          if (!timeEntry || timeEntry.workspaceId !== workspaceId) {
            throw new Error(`Time entry ${id} was not found after local write`);
          }

          return toTimeEntryEntity(timeEntry);
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
            return Option.none<TimeEntry>();
          }

          return Option.some(toTimeEntryEntity(timeEntry));
        },
        catch: toRepositoryError,
      }),
    findRunningByWorkspaceMember: ({ workspaceId, workspaceMemberId }) =>
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
            return Option.none<TimeEntry>();
          }

          return Option.some(toTimeEntryEntity(timeEntry));
        },
        catch: toRepositoryError,
      }),
  });
}
