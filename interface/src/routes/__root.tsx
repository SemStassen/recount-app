import { useAtomValue } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverTitle,
  PopoverTrigger,
} from "@recount/ui/popover";
import { AnchoredToastProvider, ToastProvider } from "@recount/ui/toast";
import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
} from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";
import { Duration, Effect } from "effect";
import { AsyncResult, Atom, AtomRegistry } from "effect/unstable/reactivity";

import { BackendAtomHttpApiClient } from "~/lib/api/atom-client";
import { env } from "~/lib/env";
import { sessionAtom } from "~/modules/session";
import type { RecountRouterContext } from "~/router";

import { NotFoundPage } from "./-not-found";

export const Route = createRootRouteWithContext<RecountRouterContext>()({
  beforeLoad: async ({ context }) => {
    const auth = await context.runtime.runPromise(
      AtomRegistry.getResult(context.atomRegistry, sessionAtom, {
        suspendOnWaiting: true,
      }).pipe(Effect.catch(() => Effect.succeed(null)))
    );

    return {
      session: auth?.session ?? null,
      user: auth?.user ?? null,
    };
  },
  component: RootLayout,
  notFoundComponent: NotFoundPage,
  head: () => ({
    scripts: [
      // <!-- ********** -->
      // <!-- REACT SCAN -->
      // <!-- ********** -->
      env.VITE_DEV
        ? {
            src: "//unpkg.com/react-scan/dist/auto.global.js",
            crossOrigin: "anonymous",
          }
        : undefined,
    ],
  }),
});

function RootLayout() {
  const ping = useAtomValue(
    BackendAtomHttpApiClient.query("ping", "ping", {}).pipe(
      Atom.withRefresh(Duration.minutes(2))
    )
  );

  return (
    <ToastProvider>
      <AnchoredToastProvider>
        <HeadContent />
        <Outlet />
        {AsyncResult.isFailure(ping) && (
          <Popover>
            <PopoverTrigger
              render={
                <Button
                  variant="destructive"
                  size="icon-lg"
                  className="fixed bottom-3 left-3"
                >
                  <Icons.Warning />
                </Button>
              }
            />
            <PopoverContent align="start">
              <PopoverTitle>Possible service degradation</PopoverTitle>
              <PopoverDescription>
                We hope to get this resolved soon.
              </PopoverDescription>
            </PopoverContent>
          </Popover>
        )}
        {env.VITE_DEV && (
          <>
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
          </>
        )}
      </AnchoredToastProvider>
    </ToastProvider>
  );
}
