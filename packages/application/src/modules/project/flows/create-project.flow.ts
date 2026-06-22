import { ProjectModule } from "@recount/core/modules/project";
import type {
  CreateProjectCommand,
  CreateProjectResult,
} from "@recount/core/modules/project/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const createProjectFlow = Effect.fn("flows.createProjectFlow")(
  function* (request: typeof CreateProjectCommand.Type) {
    const appContext = yield* ApplicationContext;
    const projectModule = yield* ProjectModule;

    const { workspace } =
      yield* appContext.authorizedWorkspace("project:create");

    const [createdProject] = yield* projectModule.createProjects({
      workspaceId: workspace.id,
      data: [request],
    });

    return createdProject satisfies typeof CreateProjectResult.Type;
  }
);
