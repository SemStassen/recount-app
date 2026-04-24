import {
  HttpSessionMiddleware,
  HttpWorkspaceMiddleware,
} from "@recount/application/shared/middleware";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect, Layer } from "effect";
import { HttpRouter } from "effect/unstable/http";

import { createElectricProxyHandler } from "../shared/create-electric-proxy-handler";

export const ProjectsRouteLayer = HttpRouter.add(
  "GET",
  "/projects",
  createElectricProxyHandler({
    table: "projects",
    buildShapeParams: () =>
      Effect.gen(function* () {
        const workspaceContext = yield* WorkspaceContext;

        return {
          where: `workspace_id = '${workspaceContext.workspace.id}'`,
        };
      }),
  })
).pipe(
  Layer.provide([HttpSessionMiddleware.layer, HttpWorkspaceMiddleware.layer])
);
