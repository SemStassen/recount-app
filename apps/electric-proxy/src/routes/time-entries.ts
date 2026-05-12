import {
  HttpSessionMiddleware,
  HttpWorkspaceMiddleware,
} from "@recount/application/shared/middleware";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";

import { createElectricProxyHandler } from "../shared/create-electric-proxy-handler";

export const TimeEntriesRouteLayer = HttpRouter.add(
  "GET",
  "/time-entries",
  createElectricProxyHandler({
    table: "time_entries",
    buildShapeParams: () =>
      Effect.gen(function* () {
        const workspaceContext = yield* WorkspaceContext;

        return {
          where: `workspace_id = '${workspaceContext.workspace.id}' AND workspace_member_id = '${workspaceContext.workspaceMember.id}'`,
        };
      }),
  })
).pipe(
  Layer.provide([HttpSessionMiddleware.layer, HttpWorkspaceMiddleware.layer])
);
