import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AtomRegistry } from "effect/unstable/reactivity";

import { userDbRegistry, workspacesAtom } from "~/modules/session";

import { AppProviders } from "./-app-providers";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    const { session, user } = context;

    if (session === null || user === null) {
      throw redirect({ to: "/sign-up" });
    }

    const workspaces = await context.runtime.runPromise(
      AtomRegistry.getResult(context.atomRegistry, workspacesAtom, {
        suspendOnWaiting: true,
      })
    );

    const userDb = await userDbRegistry.load(user.id);

    if (!user.fullName) {
      if (!location.pathname.startsWith("/profile")) {
        throw redirect({ to: "/profile" });
      }

      return { session, user, workspaces, userDb };
    }

    return { session, user, workspaces, userDb };
  },
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <AppProviders>
      <Outlet />
    </AppProviders>
  );
}
