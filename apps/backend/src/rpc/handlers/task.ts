import {
  archiveTaskFlow,
  createTaskFlow,
  unarchiveTaskFlow,
  updateTaskFlow,
} from "@recount/application/modules/project";
import { TaskRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const TaskRpcGroupLayer = TaskRpcGroup.toLayer(
  Effect.succeed({
    "Task.Create": Effect.fn("rpc.task.create")(
      function* (payload) {
        const task = yield* createTaskFlow(payload);

        return task;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Task.Update": Effect.fn("rpc.task.update")(
      function* (payload) {
        const task = yield* updateTaskFlow(payload);

        return task;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Task.Archive": Effect.fn("rpc.task.archive")(
      function* (payload) {
        const task = yield* archiveTaskFlow(payload);

        return task;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Task.Unarchive": Effect.fn("rpc.task.unarchive")(
      function* (payload) {
        const task = yield* unarchiveTaskFlow(payload);

        return task;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
