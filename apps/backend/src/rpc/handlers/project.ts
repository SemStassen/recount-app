import {
  archiveProjectFlow,
  createProjectFlow,
  unarchiveProjectFlow,
  updateProjectFlow,
} from "@recount/application/modules/project";
import { ProjectRpcGroup } from "@recount/core/rpc";
import { Effect } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

export const ProjectRpcGroupLayer = ProjectRpcGroup.toLayer(
  Effect.succeed({
    "Project.Create": Effect.fn("rpc.project.create")(
      function* (payload) {
        const project = yield* createProjectFlow(payload);

        return project;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Project.Update": Effect.fn("rpc.project.update")(
      function* (payload) {
        const project = yield* updateProjectFlow(payload);

        return project;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Project.Archive": Effect.fn("rpc.project.archive")(
      function* (payload) {
        const project = yield* archiveProjectFlow(payload);

        return project;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
    "Project.Unarchive": Effect.fn("rpc.project.unarchive")(
      function* (payload) {
        const project = yield* unarchiveProjectFlow(payload);

        return project;
      },
      Effect.catchTags({
        RepositoryError: () =>
          Effect.fail(new HttpApiError.InternalServerError()),
      })
    ),
  })
);
