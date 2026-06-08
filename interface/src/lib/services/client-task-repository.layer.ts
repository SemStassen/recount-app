import { Task } from "@recount/core/modules/project";
import { TaskRepository } from "@recount/core/modules/project/persistence";
import { RepositoryError } from "@recount/core/shared/repository";
import { Effect, Layer, Option } from "effect";

import {
  type TaskCollectionInsert,
  type TaskCollectionRow,
  toTaskCollectionInsert,
  toTaskEntity,
} from "~/db/workspace/workspace-collection-codecs";

import {
  type ClientRepositoryCollection,
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
      Effect.try({
        try: () => {
          updateCollectionItem<TaskCollectionRow, TaskCollectionInsert>(
            tasksCollection,
            id,
            update
          );

          const task = tasksCollection.get(id);

          if (!task) {
            throw new Error(`Task ${id} was not found after local write`);
          }

          return toTaskEntity(task);
        },
        catch: toRepositoryError,
      }),
    findById: ({ workspaceId, id }) =>
      Effect.try({
        try: () => {
          const task = tasksCollection.get(id);

          if (!task || task.workspaceId !== workspaceId) {
            return Option.none<Task>();
          }

          return Option.some(toTaskEntity(task));
        },
        catch: toRepositoryError,
      }),
  });
}
