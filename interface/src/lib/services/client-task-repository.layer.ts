import { Task } from "@recount/core/modules/project";
import { TaskRepository } from "@recount/core/modules/project/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { Effect, Layer, Option } from "effect";

import type {
  TaskCollectionInsert,
  TaskCollectionRow,
} from "~/db/synced-collections";
import {
  toTaskCollectionInsert,
  toTaskCollectionPatch,
  toTaskEntity,
} from "~/db/synced-collections";

import type { ClientRepositoryCollection } from "./client-repository-collection";
import { updateCollectionItem } from "./client-repository-collection";

type TaskCollection = ClientRepositoryCollection<
  TaskCollectionRow,
  TaskCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientTaskRepositoryLayer(
  tasksCollection: TaskCollection
) {
  return Layer.succeed(TaskRepository, {
    findById: ({ workspaceId, id }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          const task = tasksCollection.get(id);

          if (!task || task.workspaceId !== workspaceId) {
            return Option.none<Task>();
          }

          return Option.some(toTaskEntity(task));
        },
      }),
    insertMany: (data) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          const tasks = data.map((task) => Task.make(task));
          tasksCollection.insert(tasks.map(toTaskCollectionInsert));

          return tasks;
        },
      }),
    update: ({ id, update }) =>
      Effect.try({
        catch: toRepositoryError,
        try: () => {
          updateCollectionItem<TaskCollectionRow, TaskCollectionInsert>(
            tasksCollection,
            id,
            toTaskCollectionPatch(update)
          );

          const task = tasksCollection.get(id);

          if (!task) {
            throw new Error(`Task ${id} was not found after local write`);
          }

          return toTaskEntity(task);
        },
      }),
  });
}
