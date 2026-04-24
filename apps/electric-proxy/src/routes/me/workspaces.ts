import { HttpSessionMiddleware } from "@recount/application/shared/middleware";
import { SessionContext } from "@recount/core/shared/auth";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";

import { createElectricProxyHandler } from "../../shared/create-electric-proxy-handler";

export const WorkspacesMeRouteLayer = HttpRouter.add(
  "GET",
  "/me/workspaces",
  createElectricProxyHandler({
    table: "workspaces",
    buildShapeParams: () =>
      Effect.gen(function* () {
        const sessionContext = yield* SessionContext;

        return {
          where: `id IN (SELECT workspace_id FROM workspace_members WHERE user_id = ${sessionContext.user.id})`,
        };
      }),
  })
).pipe(Layer.provide([HttpSessionMiddleware.layer]));
