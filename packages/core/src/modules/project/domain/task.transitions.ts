import { DateTime, Option, Result } from "effect";

import { TaskId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import type { Project } from "./project.entity";
import type { ProjectArchivedError } from "./project.errors";
import { ensureProjectNotArchived } from "./project.transitions";
import { Task } from "./task.entity";

export const createTask = (params: {
  project: Project;
  data: typeof Task.jsonCreate.Type;
}): Result.Result<Task, ProjectArchivedError> =>
  Result.gen(function* () {
    yield* ensureProjectNotArchived(params.project);

    const { id, projectId: _resolvedProjectId, ...rest } = params.data;

    return Task.make({
      id: Option.getOrElse(id, () => TaskId.make(generateUUID())),
      workspaceId: params.project.workspaceId,
      archivedAt: Option.none(),
      projectId: params.project.id,
      ...rest,
    });
  });

export const updateTask = (params: {
  task: Task;
  project: Project;
  data: typeof Task.jsonUpdate.Type;
}): Result.Result<
  { entity: Task; patch: typeof Task.update.Type },
  ProjectArchivedError
> =>
  Result.gen(function* () {
    yield* ensureProjectNotArchived(params.project);

    return {
      entity: Task.make({
        ...params.task,
        ...params.data,
      }),
      patch: params.data,
    };
  });

export const archiveTask = (params: {
  task: Task;
  now: DateTime.Utc;
}): Result.Result<{
  entity: Task;
  patch: Option.Option<Pick<typeof Task.update.Type, "archivedAt">>;
}> => {
  if (Option.isSome(params.task.archivedAt)) {
    return Result.succeed({
      entity: params.task,
      patch: Option.none(),
    });
  }

  const archivedAt = Option.some(params.now);

  const updatedTask = Task.make({
    ...params.task,
    archivedAt,
  });

  return Result.succeed({
    entity: updatedTask,
    patch: Option.some({ archivedAt }),
  });
};

export const restoreTask = (params: {
  task: Task;
  project: Project;
}): Result.Result<
  {
    entity: Task;
    patch: Option.Option<Pick<typeof Task.update.Type, "archivedAt">>;
  },
  ProjectArchivedError
> =>
  Result.gen(function* () {
    yield* ensureProjectNotArchived(params.project);

    if (Option.isNone(params.task.archivedAt)) {
      return {
        entity: params.task,
        patch: Option.none(),
      };
    }

    const updatedTask = Task.make({
      ...params.task,
      archivedAt: Option.none(),
    });

    return {
      entity: updatedTask,
      patch: Option.some({ archivedAt: Option.none() }),
    };
  });
