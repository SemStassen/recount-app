import type { Task } from "@recount/core/modules/project";
import { ProjectModule } from "@recount/core/modules/project";
import type { CreateTaskResult } from "@recount/core/modules/project/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const createTaskFlow = Effect.fn("flows.createTaskFlow")(function* (
  request: typeof Task.jsonCreate.Type
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
