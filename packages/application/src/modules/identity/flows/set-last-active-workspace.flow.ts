import { IdentityModule } from "@recount/core/modules/identity";
import type {
  SetLastActiveWorkspaceCommand,
  SetLastActiveWorkspaceResult,
} from "@recount/core/modules/identity/api";
import { WorkspaceMemberModule } from "@recount/core/modules/workspace-member";
import { Effect, Option } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";

import { ApplicationContext } from "#shared/application-context";

export const setLastActiveWorkspaceFlow = Effect.fn(
  "flows.setLastActiveWorkspaceFlow"
)(
  function* (params: typeof SetLastActiveWorkspaceCommand.Type) {
    const appContext = yield* ApplicationContext;
    const { user, session } = yield* appContext.session();

    const identityModule = yield* IdentityModule;
    const workspaceMemberModule = yield* WorkspaceMemberModule;

    yield* workspaceMemberModule.assertUserWorkspaceMember({
      workspaceId: params.id,
      userId: user.id,
    });

    yield* identityModule.setLastActiveWorkspace({
      sessionId: session.id,
      workspaceId: Option.some(params.id),
    });

    return undefined satisfies typeof SetLastActiveWorkspaceResult.Type;
  },
  Effect.catchTags({
    "identity/SessionNotFoundError": () =>
      Effect.fail(new HttpApiError.Unauthorized()),
  })
);
