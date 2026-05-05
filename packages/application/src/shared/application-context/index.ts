import { SessionContext, WorkspaceContext } from "@recount/core/shared/auth";
import type {
  SessionContextShape,
  WorkspaceContextShape,
} from "@recount/core/shared/auth";
import type {
  Action,
  AuthorizationError,
} from "@recount/core/shared/authorization";
import { Context, Effect, Layer } from "effect";

import { Authorization } from "#shared/authorization";

interface ApplicationContextShape {
  readonly session: () => typeof SessionContext;
  readonly authorizedWorkspace: (
    action: Action
  ) => Effect.Effect<
    SessionContextShape & WorkspaceContextShape,
    AuthorizationError,
    SessionContext | WorkspaceContext
  >;
}

export class ApplicationContext extends Context.Service<
  ApplicationContext,
  ApplicationContextShape
>()("@recount/application/ApplicationContext") {
  static readonly layer = Layer.effect(
    ApplicationContext,
    Effect.gen(function* () {
      const authz = yield* Authorization;

      return {
        session: () => SessionContext,
        authorizedWorkspace: (action) =>
          Effect.gen(function* () {
            const sessionContext = yield* SessionContext;
            const workspaceContext = yield* WorkspaceContext;

            yield* authz.ensureAllowed({
              action,
              role: workspaceContext.workspaceMember.role,
            });

            return {
              ...sessionContext,
              ...workspaceContext,
            };
          }),
      };
    })
  );
}
