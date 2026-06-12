import { IdentityModule } from "@recount/core/modules/identity";
import { WorkspaceInvitationModule } from "@recount/core/modules/workspace-invitation";
import type {
  AcceptWorkspaceInvitationCommand,
  AcceptWorkspaceInvitationResult,
} from "@recount/core/modules/workspace-invitation/api";
import { WorkspaceMemberModule } from "@recount/core/modules/workspace-member";
import { Database } from "@recount/db";
import { Effect, Option } from "effect";

import { ApplicationContext } from "#shared/application-context";

export const acceptWorkspaceInvitationFlow = Effect.fn(
  "flows.acceptWorkspaceInvitationFlow"
)(function* (request: typeof AcceptWorkspaceInvitationCommand.Type) {
  const appContext = yield* ApplicationContext;
  const { user, session } = yield* appContext.session();

  const db = yield* Database;

  const workspaceInvitationModule = yield* WorkspaceInvitationModule;
  const workspaceMemberModule = yield* WorkspaceMemberModule;
  const identityModule = yield* IdentityModule;

  yield* db.withTransaction(
    Effect.gen(function* () {
      const invitation =
        yield* workspaceInvitationModule.acceptWorkspaceInvitation({
          id: request.id,
          email: user.email,
        });

      yield* workspaceMemberModule.createWorkspaceMember({
        workspaceId: invitation.workspaceId,
        userId: user.id,
        role: invitation.role,
        data: {
          displayName: user.fullName,
        },
      });

      yield* identityModule
        .setLastActiveWorkspace({
          sessionId: session.id,
          workspaceId: Option.some(invitation.workspaceId),
        })
        .pipe(
          Effect.catchTag("identity/SessionNotFoundError", () =>
            Effect.die(
              "invariant violated: session disappeared mid-transaction"
            )
          )
        );
    })
  );

  return undefined satisfies typeof AcceptWorkspaceInvitationResult.Type;
});
