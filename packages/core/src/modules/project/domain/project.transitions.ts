import { DateTime, Option, Result } from "effect";

import { ProjectId } from "#shared/schemas/index";
import { generateUUID } from "#shared/utils/index";

import { Project } from "./project.entity";
import {
  ProjectArchivedError,
  ProjectTargetDateBeforeStartDateError,
} from "./project.errors";

export const ensureProjectNotArchived = (
  project: Project
): Result.Result<void, ProjectArchivedError> =>
  Option.isSome(project.archivedAt)
    ? Result.fail(new ProjectArchivedError())
    : Result.succeed(undefined);

const ensureValidDateRange = (params: {
  startDate: Project["startDate"];
  targetDate: Project["targetDate"];
}): Result.Result<void, ProjectTargetDateBeforeStartDateError> => {
  if (
    Option.isSome(params.startDate) &&
    Option.isSome(params.targetDate) &&
    DateTime.isLessThan(params.targetDate.value, params.startDate.value)
  ) {
    return Result.fail(new ProjectTargetDateBeforeStartDateError());
  }

  return Result.succeed(undefined);
};

export const createProject = (params: {
  workspaceId: Project["workspaceId"];
  data: typeof Project.jsonCreate.Type;
}): Result.Result<Project, ProjectTargetDateBeforeStartDateError> =>
  Result.gen(function* () {
    const { id, ...rest } = params.data;

    const project = Project.make({
      id: Option.getOrElse(id, () => ProjectId.make(generateUUID())),
      workspaceId: params.workspaceId,
      archivedAt: Option.none(),
      ...rest,
    });

    yield* ensureValidDateRange({
      startDate: project.startDate,
      targetDate: project.targetDate,
    });

    return project;
  });

export const updateProject = (params: {
  project: Project;
  data: typeof Project.jsonUpdate.Type;
}): Result.Result<
  { entity: Project; changes: typeof Project.update.Type },
  ProjectArchivedError | ProjectTargetDateBeforeStartDateError
> =>
  Result.gen(function* () {
    yield* ensureProjectNotArchived(params.project);

    const updatedProject = Project.make({
      ...params.project,
      ...params.data,
    });

    yield* ensureValidDateRange({
      startDate: updatedProject.startDate,
      targetDate: updatedProject.targetDate,
    });

    return {
      entity: updatedProject,
      changes: params.data,
    };
  });
