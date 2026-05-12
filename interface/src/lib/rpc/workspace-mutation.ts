import { useAtomSet } from "@effect/atom-react";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { useRouteContext } from "@tanstack/react-router";

import { BackendAtomRpcClient } from "./atom-client";

export function useWorkspaceMutation<
  const Name extends Parameters<typeof BackendAtomRpcClient.mutation>[0],
>(name: Name) {
  const { workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });
  const command = useAtomSet(BackendAtomRpcClient.mutation(name), {
    mode: "promiseExit",
  });

  type CommandRequest = Extract<Parameters<typeof command>[0], object>;

  return (request: CommandRequest) => {
    return command({
      ...request,
      headers: {
        ...request.headers,
        [WORKSPACE_ID_HEADER]: workspace.id,
      },
    });
  };
}
