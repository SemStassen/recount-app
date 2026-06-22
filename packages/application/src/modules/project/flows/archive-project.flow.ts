import { ProjectModule } from "@recount/core/modules/project";
import type {
  ArchiveProjectCommand,
  ArchiveProjectResult,
} from "@recount/core/modules/project/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const archiveProjectFlow = Effect.fn("flows.archiveProjectFlow")(
  function* (request: typeof ArchiveProjectCommand.Type) {
    const appContext = yield* ApplicationContext;
    const projectModule = yield* ProjectModule;

    const { workspace } =
      yield* appContext.authorizedWorkspace("project:archive");

    yield* projectModule.archiveProject({
      id: request.id,
      workspaceId: workspace.id,
    });

    return undefined satisfies typeof ArchiveProjectResult.Type;
  }
);
