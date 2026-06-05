import {
  HttpSessionMiddleware,
  HttpWorkspaceMiddleware,
} from "@recount/application/shared/middleware";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { schema } from "@recount/db";
import { sql } from "drizzle-orm";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";

import {
  createElectricProxyHandler,
  electricColumn,
} from "../shared/create-electric-proxy-handler";

export const TimeEntriesRouteLayer = HttpRouter.add(
  "GET",
  "/time-entries",
  createElectricProxyHandler({
    table: schema.trackedTimeRowsTable,
    buildShapeParams: (table) =>
      Effect.gen(function* () {
        const workspaceContext = yield* WorkspaceContext;

        return {
          where: sql`${electricColumn(table.workspaceId)} = ${workspaceContext.workspace.id} AND ${electricColumn(table.workspaceMemberId)} = ${workspaceContext.workspaceMember.id}`,
        };
      }),
  })
).pipe(
  Layer.provide([HttpSessionMiddleware.layer, HttpWorkspaceMiddleware.layer])
);
