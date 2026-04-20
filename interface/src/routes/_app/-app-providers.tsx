import { useRouteContext } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

import { AppCommandsProvider } from "~/components/app-commands-dialog";
import { UserDbProvider } from "~/db/user/provider";

function AppProviders({ children }: PropsWithChildren) {
  const { userDb } = useRouteContext({ from: "/_app" });

  return (
    <AppCommandsProvider>
      <UserDbProvider userDb={userDb}>{children}</UserDbProvider>
    </AppCommandsProvider>
  );
}

export { AppProviders };
