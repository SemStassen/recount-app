import {
  TargetProjectNotFoundError,
  TargetTaskNotFoundError,
  TargetTaskProjectMismatchError,
} from "@recount/core/modules/time";
import { TrackedTimeTargetValidator } from "@recount/core/modules/time/ports";
import { RepositoryError } from "@recount/core/shared/repository";
import { and, eq, queryOnce } from "@tanstack/react-db";
import { Effect, Layer, Option } from "effect";

import type {
  ProjectCollectionInsert,
  ProjectCollectionRow,
  TaskCollectionInsert,
  TaskCollectionRow,
} from "~/db/workspace/workspace-collection-codecs";

import {
  type ClientRepositoryCollection,
  toQueryableCollection,
} from "./client-repository-collection";

type ProjectCollection = ClientRepositoryCollection<
  ProjectCollectionRow,
  ProjectCollectionInsert
>;

type TaskCollection = ClientRepositoryCollection<
  TaskCollectionRow,
  TaskCollectionInsert
>;

const toRepositoryError = (cause: unknown) => new RepositoryError({ cause });

export function createClientTrackedTimeTargetValidatorLayer(params: {
  readonly projectsCollection: ProjectCollection;
  readonly tasksCollection: TaskCollection;
}) {
  const queryableProjectsCollection = toQueryableCollection<
    ProjectCollectionRow,
    ProjectCollectionInsert
  >(params.projectsCollection);
  const queryableTasksCollection = toQueryableCollection<
    TaskCollectionRow,
    TaskCollectionInsert
  >(params.tasksCollection);

  return Layer.succeed(TrackedTimeTargetValidator, {
    validate: ({ workspaceId, projectId, taskId }) =>
      Effect.tryPromise({
        try: async () => {
          const project = await queryOnce((q) =>
            q
              .from({ project: queryableProjectsCollection })
              .where(({ project }) =>
                and(
                  eq(project.workspaceId, workspaceId),
                  eq(project.id, projectId)
                )
              )
              .findOne()
          );

          if (!project) {
            throw new TargetProjectNotFoundError({
              workspaceId,
              projectId,
            });
          }

          if (Option.isNone(taskId)) {
            return;
          }

          const task = await queryOnce((q) =>
            q
              .from({ task: queryableTasksCollection })
              .where(({ task }) =>
                and(
                  eq(task.workspaceId, workspaceId),
                  eq(task.id, taskId.value)
                )
              )
              .findOne()
          );

          if (!task) {
            throw new TargetTaskNotFoundError({
              workspaceId,
              taskId: taskId.value,
            });
          }

          if (task.projectId !== projectId) {
            throw new TargetTaskProjectMismatchError({
              workspaceId,
              projectId,
              taskId: taskId.value,
            });
          }
        },
        catch: (cause) =>
          cause instanceof TargetProjectNotFoundError ||
          cause instanceof TargetTaskNotFoundError ||
          cause instanceof TargetTaskProjectMismatchError
            ? cause
            : toRepositoryError(cause),
      }),
  });
}
