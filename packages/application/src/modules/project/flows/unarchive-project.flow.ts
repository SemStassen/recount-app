import { ProjectModule } from "@recount/core/modules/project";
import type {
  UnarchiveProjectCommand,
  UnarchiveProjectResult,
} from "@recount/core/modules/project/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const unarchiveProjectFlow = Effect.fn("flows.unarchiveProjectFlow")(
  function* (request: typeof UnarchiveProjectCommand.Type) {
    const appContext = yield* ApplicationContext;
    const projectModule = yield* ProjectModule;

    const { workspace } =
      yield* appContext.authorizedWorkspace("project:unarchive");

    yield* projectModule.unarchiveProject({
      id: request.id,
      workspaceId: workspace.id,
    });

    return undefined satisfies typeof UnarchiveProjectResult.Type;
  }
);
