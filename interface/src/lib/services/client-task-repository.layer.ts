import { Task, TaskRepository } from "@recount/core/modules/project";
import { RepositoryError } from "@recount/core/shared/repository";
import { eq, queryOnce } from "@tanstack/react-db";
import { DateTime, Effect, Layer, Option } from "effect";

import {
  type ClientRepositoryCollection,
  updateCollectionItem,
} from "./client-repository-collection";

type TaskRow = typeof Task.json.Type;
type TaskCollection = ClientRepositoryCollection<TaskRow>;

interface TaskCollectionInsert {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly name: string;
  readonly archivedAt: Date | null;
}

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

const normalizeTask = (task: TaskRow): Task =>
  Task.make({
    id: task.id,
    workspaceId: task.workspaceId,
    projectId: task.projectId,
    name: task.name,
    archivedAt: task.archivedAt,
  });

const toCollectionInsert = (task: Task): TaskCollectionInsert => ({
  id: task.id,
  workspaceId: task.workspaceId,
  projectId: task.projectId,
  name: task.name,
  archivedAt: Option.map(task.archivedAt, DateTime.toDateUtc).pipe(
    Option.getOrNull
  ),
});

export function createClientTaskRepositoryLayer(
  tasksCollection: TaskCollection
) {
  return Layer.succeed(TaskRepository, {
    insertMany: (data) =>
      Effect.try({
        try: () => {
          const tasks = data.map(normalizeTask);
          tasksCollection.insert(tasks.map(toCollectionInsert));

          return tasks;
        },
        catch: toRepositoryError,
      }),
    update: ({ id, update }) =>
      Effect.tryPromise({
        try: async () => {
          updateCollectionItem(tasksCollection, id, update);

          const task = await queryOnce((q) =>
            q
              .from({ task: tasksCollection })
              .where(({ task }) => eq(task.id, id))
              .findOne()
          );

          if (!task) {
            throw new Error(`Task ${id} was not found after local write`);
          }

          return normalizeTask(task);
        },
        catch: toRepositoryError,
      }),
    findById: ({ workspaceId, id }) =>
      Effect.tryPromise({
        try: async () => {
          const task = await queryOnce((q) =>
            q
              .from({ task: tasksCollection })
              .where(({ task }) => eq(task.id, id))
              .findOne()
          );

          if (!task || task.workspaceId !== workspaceId) {
            return Option.none<Task>();
          }

          return Option.some(normalizeTask(task));
        },
        catch: toRepositoryError,
      }),
  });
}
