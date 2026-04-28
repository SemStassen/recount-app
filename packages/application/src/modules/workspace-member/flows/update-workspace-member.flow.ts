import type {
  UpdateWorkspaceMemberCommand,
  UpdateWorkspaceMemberResult,
} from "@recount/core/contracts";
import { WorkspaceMemberModule } from "@recount/core/modules/workspace-member";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization";

export const updateWorkspaceMemberFlow = Effect.fn(
  "flows.updateWorkspaceMemberFlow"
)(function* (request: typeof UpdateWorkspaceMemberCommand.Type) {
  const { workspaceMember, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const workspaceMemberModule = yield* WorkspaceMemberModule;

  yield* authz.ensureAllowed({
    action: "workspace:patch",
    role: workspaceMember.role,
  });

  const updatedWorkspaceMember =
    yield* workspaceMemberModule.updateWorkspaceMember({
      id: workspaceMember.id,
      workspaceId: workspace.id,
      data: request,
    });

  return updatedWorkspaceMember satisfies typeof UpdateWorkspaceMemberResult.Type;
});
