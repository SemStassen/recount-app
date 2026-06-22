import { useRouteContext } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

import { UserDbProvider } from "~/modules/session";

function AppProviders({ children }: PropsWithChildren) {
  const { userDb } = useRouteContext({ from: "/_app" });

  return <UserDbProvider userDb={userDb}>{children}</UserDbProvider>;
}

export { AppProviders };
