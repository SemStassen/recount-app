import { HttpSessionMiddleware } from "@recount/application/shared/middleware";
import { SessionContext } from "@recount/core/shared/auth";
import { schema } from "@recount/db";
import { sql } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";

import {
  createElectricProxyHandler,
  electricColumn,
} from "../../shared/create-electric-proxy-handler";

export const UserSettingsMeRouteLayer = HttpRouter.add(
  "GET",
  "/me/user-settings",
  createElectricProxyHandler({
    table: schema.userSettingsTable,
    buildShapeParams: (table) =>
      Effect.gen(function* () {
        const sessionContext = yield* SessionContext;

        return {
          where: sql`${electricColumn(table.userId)} = ${sessionContext.user.id}`,
        };
      }),
  })
).pipe(Layer.provide([HttpSessionMiddleware.layer]));
