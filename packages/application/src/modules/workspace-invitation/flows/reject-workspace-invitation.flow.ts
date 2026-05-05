import type {
  RejectWorkspaceInvitationCommand,
  RejectWorkspaceInvitationResult,
} from "@recount/core/contracts";
import { WorkspaceInvitationModule } from "@recount/core/modules/workspace-invitation";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const rejectWorkspaceInvitationFlow = Effect.fn(
  "flows.rejectWorkspaceInvitationFlow"
)(function* (request: typeof RejectWorkspaceInvitationCommand.Type) {
  const appContext = yield* ApplicationContext;
  const { user } = yield* appContext.session();

  const workspaceInvitationModule = yield* WorkspaceInvitationModule;

  yield* workspaceInvitationModule.rejectWorkspaceInvitation({
    id: request.id,
    email: user.email,
  });

  return undefined satisfies typeof RejectWorkspaceInvitationResult.Type;
});
