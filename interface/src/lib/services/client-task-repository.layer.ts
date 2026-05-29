import { Task, TaskRepository } from "@recount/core/modules/project";
import { RepositoryError } from "@recount/core/shared/repository";
import { DateTime, Effect, Layer, Option } from "effect";

interface TaskCollection {
  get: (id: Task["id"]) => Task | undefined;
  insert: (data: Array<TaskCollectionInsert>) => unknown;
  update: {
    (ids: Array<unknown>, update: (drafts: Array<unknown>) => void): unknown;
    (id: unknown, update: (draft: unknown) => void): unknown;
  };
  values: () => Iterable<Task>;
}

interface TaskCollectionInsert {
  readonly id: string;
  readonly workspaceId: string;
  readonly projectId: string;
  readonly name: string;
  readonly archivedAt: Date | null;
}

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

const normalizeTask = (task: Task): Task =>
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
      Effect.try({
        try: () => {
          tasksCollection.update(id, (draftValue) => {
            const draft = draftValue as Record<keyof typeof update, unknown>;
            for (const key of Object.keys(update) as Array<
              keyof typeof update
            >) {
              draft[key] = update[key];
            }
          });

          return undefined;
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

          return Option.some(normalizeTask(task));
        },
        catch: toRepositoryError,
      }),
  });
}
