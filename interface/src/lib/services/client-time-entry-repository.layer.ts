import { TimeEntry, TimeEntryRepository } from "@recount/core/modules/time";
import { RepositoryError } from "@recount/core/shared/repository";
import { and, eq, queryOnce } from "@tanstack/react-db";
import { DateTime, Effect, Layer, Option, Schema } from "effect";

import {
  deleteCollectionItems,
  type ClientRepositoryCollection,
  updateCollectionItem,
} from "./client-repository-collection";

type TimeEntryRow = typeof TimeEntry.json.Type;
type TimeEntryCollection = ClientRepositoryCollection<TimeEntryRow>;

interface TimeEntryCollectionInsert {
  readonly id: string;
  readonly workspaceId: string;
  readonly workspaceMemberId: string;
  readonly projectId: string;
  readonly taskId: string | null;
  readonly startedAt: Date;
  readonly stoppedAt: Date | null;
  readonly notes: Schema.Json;
}

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

const normalizeTimeEntry = (timeEntry: TimeEntryRow): TimeEntry =>
  TimeEntry.make({
    id: timeEntry.id,
    workspaceId: timeEntry.workspaceId,
    workspaceMemberId: timeEntry.workspaceMemberId,
    projectId: timeEntry.projectId,
    taskId: timeEntry.taskId,
    startedAt: timeEntry.startedAt,
    stoppedAt: timeEntry.stoppedAt,
    notes: timeEntry.notes,
  });

const optionDateTimeToDate = (value: Option.Option<DateTime.Utc>) =>
  Option.map(value, DateTime.toDateUtc).pipe(Option.getOrNull);

const toCollectionInsert = (
  timeEntry: TimeEntry
): TimeEntryCollectionInsert => ({
  id: timeEntry.id,
  workspaceId: timeEntry.workspaceId,
  workspaceMemberId: timeEntry.workspaceMemberId,
  projectId: timeEntry.projectId,
  taskId: Option.getOrNull(timeEntry.taskId),
  startedAt: DateTime.toDateUtc(timeEntry.startedAt),
  stoppedAt: optionDateTimeToDate(timeEntry.stoppedAt),
  notes: Option.getOrNull(timeEntry.notes),
});

export function createClientTimeEntryRepositoryLayer(
  timeEntriesCollection: TimeEntryCollection
) {
  return Layer.succeed(TimeEntryRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          const timeEntries = data.map(normalizeTimeEntry);
          timeEntriesCollection.insert(timeEntries.map(toCollectionInsert));

          return timeEntries;
        },
        catch: toRepositoryError,
      }),
    update: ({ workspaceId, id, update }) =>
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem(timeEntriesCollection, id, update);

          const timeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: timeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, id))
              .findOne()
          );

          if (!timeEntry || timeEntry.workspaceId !== workspaceId) {
            throw new Error(`Time entry ${id} was not found after local write`);
          }

          return normalizeTimeEntry(timeEntry);
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
              .from({ timeEntry: timeEntriesCollection })
              .where(({ timeEntry }) => eq(timeEntry.id, id))
              .findOne()
          );

          if (!timeEntry || timeEntry.workspaceId !== workspaceId) {
            return Option.none<TimeEntry>();
          }

          return Option.some(normalizeTimeEntry(timeEntry));
        },
        catch: toRepositoryError,
      }),
    findRunningByWorkspaceMember: ({ workspaceId, workspaceMemberId }) =>
      Effect.tryPromise({
        try: async () => {
          const timeEntry = await queryOnce((q) =>
            q
              .from({ timeEntry: timeEntriesCollection })
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

          return Option.some(normalizeTimeEntry(timeEntry));
        },
        catch: toRepositoryError,
      }),
  });
}
