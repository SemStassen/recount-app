import type {
  CancelWorkspaceInvitationCommand,
  CancelWorkspaceInvitationResult,
} from "@recount/core/contracts";
import { WorkspaceInvitationModule } from "@recount/core/modules/workspace-invitation";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const cancelWorkspaceInvitationFlow = Effect.fn(
  "flows.cancelWorkspaceInvitationFlow"
)(function* (request: typeof CancelWorkspaceInvitationCommand.Type) {
  const appContext = yield* ApplicationContext;
  const workspaceInvitationModule = yield* WorkspaceInvitationModule;

  const { workspace } = yield* appContext.authorizedWorkspace(
    "workspace:cancel_invite"
  );

  yield* workspaceInvitationModule.cancelWorkspaceInvitation({
    id: request.id,
    workspaceId: workspace.id,
  });

  return undefined satisfies typeof CancelWorkspaceInvitationResult.Type;
});
