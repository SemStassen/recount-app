import type {
  RestoreProjectCommand,
  RestoreProjectResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const restoreProjectFlow = Effect.fn("flows.restoreProjectFlow")(
  function* (request: typeof RestoreProjectCommand.Type) {
    const appContext = yield* ApplicationContext;
    const projectModule = yield* ProjectModule;

    const { workspace } =
      yield* appContext.authorizedWorkspace("project:restore");

    yield* projectModule.restoreProject({
      id: request.id,
      workspaceId: workspace.id,
    });

    return undefined satisfies typeof RestoreProjectResult.Type;
  }
);
