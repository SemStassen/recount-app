import type {
  UnarchiveTaskCommand,
  UnarchiveTaskResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const unarchiveTaskFlow = Effect.fn("flows.unarchiveTaskFlow")(
  function* (request: typeof UnarchiveTaskCommand.Type) {
    const appContext = yield* ApplicationContext;
    const projectModule = yield* ProjectModule;

    const { workspace } = yield* appContext.authorizedWorkspace(
      "project:unarchive_task"
    );

    yield* projectModule.unarchiveTask({
      id: request.id,
      workspaceId: workspace.id,
    });

    return undefined satisfies typeof UnarchiveTaskResult.Type;
  }
);
