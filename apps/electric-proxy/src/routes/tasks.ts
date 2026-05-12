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

export const TasksRouteLayer = HttpRouter.add(
  "GET",
  "/tasks",
  createElectricProxyHandler({
    table: schema.tasksTable,
    buildShapeParams: (table) =>
      Effect.gen(function* () {
        const workspaceContext = yield* WorkspaceContext;

        return {
          where: sql`${electricColumn(table.workspaceId)} = ${workspaceContext.workspace.id}`,
        };
      }),
  })
).pipe(
  Layer.provide([HttpSessionMiddleware.layer, HttpWorkspaceMiddleware.layer])
);
