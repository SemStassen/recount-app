import type {
  UpdateProjectCommand,
  UpdateProjectResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateProjectFlow = Effect.fn("flows.updateProjectFlow")(
  function* (request: typeof UpdateProjectCommand.Type) {
    const appContext = yield* ApplicationContext;
    const projectModule = yield* ProjectModule;

    const { workspace } =
      yield* appContext.authorizedWorkspace("project:patch");

    const updatedProject = yield* projectModule.updateProject({
      id: request.id,
      workspaceId: workspace.id,
      data: request.data,
    });

    return updatedProject satisfies typeof UpdateProjectResult.Type;
  }
);
