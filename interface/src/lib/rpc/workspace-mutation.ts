import { useAtomSet } from "@effect/atom-react";
import { WORKSPACE_ID_HEADER } from "@recount/core/shared/headers";
import { useRouteContext } from "@tanstack/react-router";
import type { Exit } from "effect";
import type { Atom } from "effect/unstable/reactivity";

import { BackendAtomRpcClient } from "./atom-client";

type WorkspaceMutationName = Parameters<
  typeof BackendAtomRpcClient.mutation
>[0];

type PromiseExit<T> =
  T extends Atom.AtomResultFn<infer Arg, infer A, infer E>
    ? (request: Arg) => Promise<Exit.Exit<A, E>>
    : never;

export function useWorkspaceMutation<const Name extends WorkspaceMutationName>(
  name: Name
) {
  const { workspace } = useRouteContext({ from: "/_app/$workspaceSlug" });
  const mutation = BackendAtomRpcClient.mutation(name);
  const command = useAtomSet(mutation, {
    mode: "promiseExit",
  }) as PromiseExit<typeof mutation>;

  return ((request) =>
    command({
      ...request,
      headers: {
        ...request.headers,
        [WORKSPACE_ID_HEADER]: workspace.id,
      },
    })) as PromiseExit<typeof mutation>;
}
