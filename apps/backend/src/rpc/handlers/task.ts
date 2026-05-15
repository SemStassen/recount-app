import {
  archiveTaskFlow,
  createTaskFlow,
  updateTaskFlow,
} from "@recount/application/modules/project";
import { TaskRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const TaskRpcGroupLayer = TaskRpcGroup.toLayer(
  Effect.succeed({
    "Task.Create": Effect.fn("rpc.task.create")(
      function* (payload) {
        const project = yield* createTaskFlow(payload);

        return project;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Task.Update": Effect.fn("rpc.task.update")(
      function* (payload) {
        const project = yield* updateTaskFlow(payload);

        return project;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Task.Archive": Effect.fn("rpc.task.archive")(
      function* (payload) {
        const project = yield* archiveTaskFlow(payload);

        return project;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Task.Restore": Effect.fn("rpc.task.restore")(
      function* (payload) {
        const project = yield* archiveTaskFlow(payload);

        return project;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
