import { HttpSessionMiddleware } from "@recount/core-server/shared/middleware";
import { SessionContext } from "@recount/core/shared/auth";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";

import { createElectricProxyHandler } from "../../shared/create-electric-proxy-handler";

export const UserSettingsMeRouteLayer = HttpRouter.add(
  "GET",
  "/me/user-settings",
  createElectricProxyHandler({
    table: "user_settings",
    buildShapeParams: () =>
      Effect.gen(function* () {
        const sessionContext = yield* SessionContext;

        return {
          where: `user_id = '${sessionContext.user.id}'`,
        };
      }),
  })
).pipe(Layer.provide([HttpSessionMiddleware.layer]));
