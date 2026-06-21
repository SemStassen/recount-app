import { createRouter } from "@tanstack/react-router";

import type { AppAtomRegistry } from "./atoms/registry";
import type { WorkspaceDbRegistry } from "./db/workspace/workspace-db-registry";
import type { AppRuntime } from "./lib/runtime";
import { ErrorPage } from "./routes/-error";
import { NotFoundPage } from "./routes/-not-found";
import { routeTree } from "./routeTree.gen";

export interface RecountRouterContext {
  readonly atomRegistry: AppAtomRegistry;
  readonly runtime: AppRuntime;
  readonly workspaceDbRegistry: WorkspaceDbRegistry;
}

export const createRecountRouter = (context: RecountRouterContext) =>
  createRouter({
    routeTree,
    context,
    defaultPreload: "intent",
    scrollRestoration: true,
    defaultStructuralSharing: true,
    defaultPreloadStaleTime: 0,
    defaultPendingMs: 300,
    defaultPendingMinMs: 300,
    defaultNotFoundComponent: NotFoundPage,
    defaultErrorComponent: ErrorPage,
  });

export type RecountRouter = ReturnType<typeof createRecountRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: RecountRouter;
  }
}
