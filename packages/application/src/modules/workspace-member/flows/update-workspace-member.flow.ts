import { WorkspaceMemberModule } from "@recount/core/modules/workspace-member";
import type {
  UpdateWorkspaceMemberCommand,
  UpdateWorkspaceMemberResult,
} from "@recount/core/modules/workspace-member/api";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const updateWorkspaceMemberFlow = Effect.fn(
  "flows.updateWorkspaceMemberFlow"
)(function* (request: typeof UpdateWorkspaceMemberCommand.Type) {
  const appContext = yield* ApplicationContext;
  const workspaceMemberModule = yield* WorkspaceMemberModule;

  const { workspaceMember, workspace } =
    yield* appContext.authorizedWorkspace("workspace:patch");

  const updatedWorkspaceMember =
    yield* workspaceMemberModule.updateWorkspaceMember({
      id: workspaceMember.id,
      workspaceId: workspace.id,
      data: request,
    });

  return updatedWorkspaceMember satisfies typeof UpdateWorkspaceMemberResult.Type;
});
