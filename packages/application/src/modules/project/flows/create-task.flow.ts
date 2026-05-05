import type {
  CreateTaskCommand,
  CreateTaskResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const createTaskFlow = Effect.fn("flows.createTaskFlow")(function* (
  request: typeof CreateTaskCommand.Type
) {
  const appContext = yield* ApplicationContext;
  const projectModule = yield* ProjectModule;

  const { workspace } = yield* appContext.authorizedWorkspace(
    "project:create_task"
  );

  const [createdTask] = yield* projectModule.createTasks({
    workspaceId: workspace.id,
    data: [request],
  });

  return createdTask satisfies typeof CreateTaskResult.Type;
});
