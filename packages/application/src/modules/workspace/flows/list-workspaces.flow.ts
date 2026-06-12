import { WorkspaceModule } from "@recount/core/modules/workspace";
import { WorkspaceMemberModule } from "@recount/core/modules/workspace-member";
import type {
  ListWorkspacesCommand,
  ListWorkspacesResult,
} from "@recount/core/modules/workspace/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const listWorkspacesFlow = Effect.fn("flows.listWorkspacesFlow")(
  function* (_request: typeof ListWorkspacesCommand.Type) {
    const appContext = yield* ApplicationContext;
    const { user } = yield* appContext.session();

    const workspaceMemberModule = yield* WorkspaceMemberModule;
    const workspaceModule = yield* WorkspaceModule;

    const userWorkspaceMemberships = yield* workspaceMemberModule.listByUserId(
      user.id
    );

    const workspaces = yield* workspaceModule.listWorkspacesByIds(
      userWorkspaceMemberships.map((m) => m.workspaceId)
    );

    return workspaces satisfies typeof ListWorkspacesResult.Type;
  }
);
