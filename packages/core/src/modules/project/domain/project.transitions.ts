import type { DateTime} from "effect";
import { Option, Result } from "effect";

import { HexColor, ProjectId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Project } from "./project.entity";
import { ProjectArchivedError } from "./project.errors";

export const ensureProjectNotArchived = (
  project: Project
): Result.Result<void, ProjectArchivedError> =>
  Option.isSome(project.archivedAt)
    ? Result.fail(new ProjectArchivedError())
    : Result.succeed(undefined);

export const createProject = (params: {
  workspaceId: Project["workspaceId"];
  data: typeof Project.jsonCreate.Type;
}): Result.Result<Project> => {
  const { id, ...rest } = params.data;

  const project = Project.make({
    id:
      id === undefined
        ? ProjectId.make(generateUUID())
        : Option.getOrElse(id, () => ProjectId.make(generateUUID())),
    workspaceId: params.workspaceId,
    ...rest,
    color: rest.color ?? HexColor.make("#000000"),
    isBillable: rest.isBillable ?? false,
    notes: Option.none(),
    archivedAt: Option.none(),
  });

  return Result.succeed(project);
};

export const updateProject = (params: {
  project: Project;
  data: typeof Project.jsonUpdate.Type;
}): Result.Result<
  { entity: Project; patch: typeof Project.update.Type },
  ProjectArchivedError
> =>
  Result.gen(function* () {
    yield* ensureProjectNotArchived(params.project);

    const updatedProject = Project.make({
      ...params.project,
      ...params.data,
    });

    return {
      entity: updatedProject,
      patch: params.data,
    };
  });

export const archiveProject = (params: {
  project: Project;
  now: DateTime.Utc;
}): Result.Result<{
  entity: Project;
  patch: Option.Option<Pick<typeof Project.update.Type, "archivedAt">>;
}> => {
  if (Option.isSome(params.project.archivedAt)) {
    return Result.succeed({
      entity: params.project,
      patch: Option.none(),
    });
  }

  const archivedAt = Option.some(params.now);

  const updatedProject = Project.make({
    ...params.project,
    archivedAt,
  });

  return Result.succeed({
    entity: updatedProject,
    patch: Option.some({ archivedAt }),
  });
};

export const unarchiveProject = (params: {
  project: Project;
}): Result.Result<{
  entity: Project;
  patch: Option.Option<Pick<typeof Project.update.Type, "archivedAt">>;
}> => {
  if (Option.isNone(params.project.archivedAt)) {
    return Result.succeed({
      entity: params.project,
      patch: Option.none(),
    });
  }

  const updatedProject = Project.make({
    ...params.project,
    archivedAt: Option.none(),
  });

  return Result.succeed({
    entity: updatedProject,
    patch: Option.some({ archivedAt: Option.none() }),
  });
};
