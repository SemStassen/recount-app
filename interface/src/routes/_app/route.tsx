import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AtomRegistry } from "effect/unstable/reactivity";

import { workspacesAtom } from "~/atoms/auth.atoms";
import { atomRegistry } from "~/atoms/registry";
import { getUserDb } from "~/db/user/get-user-db";
import { runtime } from "~/lib/runtime";

import { AppProviders } from "./-app-providers";

export const Route = createFileRoute("/_app")({
  beforeLoad: async ({ context, location }) => {
    const { session, user } = context;

    if (session === null || user === null) {
      throw redirect({ to: "/sign-up" });
    }

    const workspaces = await runtime.runPromise(
      AtomRegistry.getResult(atomRegistry, workspacesAtom, {
        suspendOnWaiting: true,
      })
    );

    const userDb = await getUserDb(user.id);

    if (!user.fullName) {
      if (!location.pathname.startsWith("/profile")) {
        throw redirect({ to: "/profile" });
      }

      return { session, user, workspaces, userDb };
    }

    return { session, user, workspaces, userDb };
  },
  loader: async ({ context }) => {
    await context.userDb.preload();
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
