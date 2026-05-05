import type {
  RestoreTaskCommand,
  RestoreTaskResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const restoreTaskFlow = Effect.fn("flows.restoreTaskFlow")(function* (
  request: typeof RestoreTaskCommand.Type
) {
  const appContext = yield* ApplicationContext;
  const projectModule = yield* ProjectModule;

  const { workspace } = yield* appContext.authorizedWorkspace(
    "project:restore_task"
  );

  yield* projectModule.restoreTask({
    id: request.id,
    workspaceId: workspace.id,
  });

  return undefined satisfies typeof RestoreTaskResult.Type;
});
