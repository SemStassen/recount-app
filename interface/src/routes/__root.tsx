import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Effect } from "effect";
import { AtomRegistry } from "effect/unstable/reactivity";

import { sessionAtom } from "~/atoms/auth.atoms";
import { atomRegistry } from "~/atoms/registry";
import { runtime } from "~/lib/runtime";

export const Route = createRootRoute({
  beforeLoad: async () => {
    console.log("auth");
    const auth = await runtime.runPromise(
      AtomRegistry.getResult(atomRegistry, sessionAtom, {
        suspendOnWaiting: true,
      }).pipe(
        Effect.catchTags({
          Unauthorized: () => Effect.succeed(null),
        })
      )
    );
    console.log("after auth");

    return { auth };
  },
  component: RootLayout,
});

function RootLayout() {
  return <Outlet />;
}
