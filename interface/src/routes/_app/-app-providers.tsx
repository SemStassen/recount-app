import { useRouteContext } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

import { AppCommandsProvider } from "~/components/app-commands-dialog";
import { UserDbProvider } from "~/db/user/provider";

function AppProviders({ children }: PropsWithChildren) {
  const { auth } = useRouteContext({ from: "/_app" });

  return (
    <AppCommandsProvider>
      <UserDbProvider userId={auth.user.id}>{children}</UserDbProvider>
    </AppCommandsProvider>
  );
}

export { AppProviders };
