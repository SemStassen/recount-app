import type {
  ArchiveTaskCommand,
  ArchiveTaskResult,
} from "@recount/core/contracts";
import { ProjectModule } from "@recount/core/modules/project";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const archiveTaskFlow = Effect.fn("flows.archiveTaskFlow")(function* (
  request: typeof ArchiveTaskCommand.Type
) {
  const appContext = yield* ApplicationContext;
  const projectModule = yield* ProjectModule;

  const { workspace } = yield* appContext.authorizedWorkspace(
    "project:archive_task"
  );

  yield* projectModule.archiveTask({
    id: request.id,
    workspaceId: workspace.id,
  });

  return undefined satisfies typeof ArchiveTaskResult.Type;
});
