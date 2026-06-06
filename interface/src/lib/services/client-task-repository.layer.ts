import { Task } from "@recount/core/modules/project";
import { TaskRepository } from "@recount/core/modules/project/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { eq, queryOnce } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

import {
  type TaskCollectionInsert,
  type TaskCollectionRow,
  toTaskCollectionInsert,
  toTaskEntity,
} from "~/db/workspace/workspace-collection-codecs";

import {
  type ClientRepositoryCollection,
  toQueryableCollection,
  updateCollectionItem,
} from "./client-repository-collection";

type TaskCollection = ClientRepositoryCollection<
  TaskCollectionRow,
  TaskCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientTaskRepositoryLayer(
  tasksCollection: TaskCollection
) {
  const queryableTasksCollection = toQueryableCollection<
    TaskCollectionRow,
    TaskCollectionInsert
  >(tasksCollection);

  return Layer.succeed(TaskRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          const tasks = data.map(toTaskEntity);
          tasksCollection.insert(tasks.map(toTaskCollectionInsert));

          return tasks;
        },
        catch: toRepositoryError,
      }),
    update: ({ id, update }) =>
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem<TaskCollectionRow, TaskCollectionInsert>(
            tasksCollection,
            id,
            update
          );

          const task = await queryOnce((q) =>
            q
              .from({ task: queryableTasksCollection })
              .where(({ task }) => eq(task.id, id))
              .findOne()
          );

          if (!task) {
            throw new Error(`Task ${id} was not found after local write`);
          }

          return toTaskEntity(task);
        },
        catch: toRepositoryError,
      }),
    findById: ({ workspaceId, id }) =>
      Effect.tryPromise({
        try: async () => {
          const task = await queryOnce((q) =>
            q
              .from({ task: queryableTasksCollection })
              .where(({ task }) => eq(task.id, id))
              .findOne()
          );

          if (!task || task.workspaceId !== workspaceId) {
            return Option.none<Task>();
          }

          return Option.some(toTaskEntity(task));
        },
        catch: toRepositoryError,
      }),
  });
}
