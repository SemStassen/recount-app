import {
  ProjectRepository,
  TaskRepository,
} from "@recount/core/modules/project/persistence";
import {
  TargetProjectNotFoundError,
  TargetTaskNotFoundError,
  TargetTaskProjectMismatchError,
} from "@recount/core/modules/time";
import { TrackedTimeTargetValidator } from "@recount/core/modules/time/ports";
import { Effect, Layer, Option } from "effect";

export const TrackedTimeTargetValidatorLayer = Layer.effect(
  TrackedTimeTargetValidator,
  Effect.gen(function* () {
    const projectRepo = yield* ProjectRepository;
    const taskRepo = yield* TaskRepository;

    return {
      validate: (params) =>
        Effect.gen(function* () {
          const project = yield* projectRepo.findById({
            workspaceId: params.workspaceId,
            id: params.projectId,
          });

          if (Option.isNone(project)) {
            return yield* new TargetProjectNotFoundError({
              workspaceId: params.workspaceId,
              projectId: params.projectId,
            });
          }

          if (Option.isNone(params.taskId)) {
            return;
          }

          const task = yield* taskRepo.findById({
            workspaceId: params.workspaceId,
            id: params.taskId.value,
          });

          if (Option.isNone(task)) {
            return yield* new TargetTaskNotFoundError({
              workspaceId: params.workspaceId,
              taskId: params.taskId.value,
            });
          }

          if (task.value.projectId !== params.projectId) {
            return yield* new TargetTaskProjectMismatchError({
              workspaceId: params.workspaceId,
              projectId: params.projectId,
              taskId: params.taskId.value,
            });
          }
        }),
    };
  })
);
