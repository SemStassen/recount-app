import {
  TargetProjectNotFoundError,
  TargetTaskNotFoundError,
  TargetTaskProjectMismatchError,
} from "@recount/core/modules/time";
import { TrackedTimeTargetValidator } from "@recount/core/modules/time/ports";
import { RepositoryError } from "@recount/core/shared/repository";
import { Effect, Layer, Option } from "effect";

import type {
  ProjectCollectionInsert,
  ProjectCollectionRow,
  TaskCollectionInsert,
  TaskCollectionRow,
} from "~/db/synced-collections";

import type { ClientRepositoryCollection } from "./client-repository-collection";

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
  return Layer.succeed(TrackedTimeTargetValidator, {
    validate: ({ workspaceId, projectId, taskId }) =>
      Effect.try({
        catch: (cause) =>
          cause instanceof TargetProjectNotFoundError ||
          cause instanceof TargetTaskNotFoundError ||
          cause instanceof TargetTaskProjectMismatchError
            ? cause
            : toRepositoryError(cause),
        try: () => {
          const project = params.projectsCollection.get(projectId);

          if (!project || project.workspaceId !== workspaceId) {
            throw new TargetProjectNotFoundError({
              projectId,
              workspaceId,
            });
          }

          if (Option.isNone(taskId)) {
            return;
          }

          const task = params.tasksCollection.get(taskId.value);

          if (!task || task.workspaceId !== workspaceId) {
            throw new TargetTaskNotFoundError({
              taskId: taskId.value,
              workspaceId,
            });
          }

          if (task.projectId !== projectId) {
            throw new TargetTaskProjectMismatchError({
              projectId,
              taskId: taskId.value,
              workspaceId,
            });
          }
        },
      }),
  });
}
