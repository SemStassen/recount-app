import { createRouter } from "@tanstack/react-router";

import { ErrorPage } from "./routes/-error";
import { NotFoundPage } from "./routes/-not-found";
import { routeTree } from "./routeTree.gen";

// This is required for Tanstack router to work properly
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  defaultPendingMs: 300,
  defaultPendingMinMs: 300,
  defaultNotFoundComponent: NotFoundPage,
  defaultErrorComponent: ErrorPage,
});
