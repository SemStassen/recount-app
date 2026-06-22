import { ProjectModule } from "@recount/core/modules/project";
import type {
  UpdateTaskCommand,
  UpdateTaskResult,
} from "@recount/core/modules/project/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateTaskFlow = Effect.fn("flows.updateTaskFlow")(function* (
  request: typeof UpdateTaskCommand.Type
) {
  const appContext = yield* ApplicationContext;
  const projectModule = yield* ProjectModule;

  const { workspace } =
    yield* appContext.authorizedWorkspace("project:patch_task");

  const updatedTask = yield* projectModule.updateTask({
    id: request.id,
    workspaceId: workspace.id,
    data: request.data,
  });

  return updatedTask satisfies typeof UpdateTaskResult.Type;
});
