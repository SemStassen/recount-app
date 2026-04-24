import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Effect } from "effect";
import { AtomRegistry } from "effect/unstable/reactivity";

import { sessionAtom } from "~/atoms/auth.atoms";
import { atomRegistry } from "~/atoms/registry";
import { env } from "~/lib/env";
import { runtime } from "~/lib/runtime";

export const Route = createRootRoute({
  beforeLoad: async () => {
    const auth = await runtime.runPromise(
      AtomRegistry.getResult(atomRegistry, sessionAtom, {
        suspendOnWaiting: true,
      }).pipe(
        Effect.catchTags({
          Unauthorized: () => Effect.succeed(null),
        })
      )
    );

    return {
      session: auth?.session ?? null,
      user: auth?.user ?? null,
    };
  },
  component: RootLayout,
});

function RootLayout() {
  return (
    <>
      <Outlet />
      {env.VITE_DEV && (
        <TanStackDevtools
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: "TanStack Form",
              render: <FormDevtoolsPanel />,
            },
          ]}
        />
      )}
    </>
  );
}
