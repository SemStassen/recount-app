import { WorkspaceModule } from "@recount/core/modules/workspace";
import type {
  UpdateWorkspaceCommand,
  UpdateWorkspaceResult,
} from "@recount/core/modules/workspace/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateWorkspaceFlow = Effect.fn("flows.updateWorkspaceFlow")(
  function* (request: typeof UpdateWorkspaceCommand.Type) {
    const appContext = yield* ApplicationContext;
    const workspaceModule = yield* WorkspaceModule;

    const { workspace } =
      yield* appContext.authorizedWorkspace("workspace:patch");

    const updatedWorkspace = yield* workspaceModule.updateWorkspace({
      id: workspace.id,
      data: request,
    });

    return updatedWorkspace satisfies typeof UpdateWorkspaceResult.Type;
  }
);
