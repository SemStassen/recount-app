import { useRouteContext } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";

import { WorkspaceDbProvider } from "~/modules/workspace";

export function WorkspaceProviders({ children }: PropsWithChildren) {
  const { workspaceDb } = useRouteContext({
    from: "/_app/$workspaceSlug",
  });

  return (
    <WorkspaceDbProvider workspaceDb={workspaceDb}>
      {children}
    </WorkspaceDbProvider>
  );
}
