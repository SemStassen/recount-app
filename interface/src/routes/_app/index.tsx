import { createFileRoute, redirect } from "@tanstack/react-router";
import { Effect, Option } from "effect";

import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

export const Route = createFileRoute("/_app/")({
  beforeLoad: async ({ context }) => {
    const workspaces = await context.app.runtime.runPromise(
      Effect.gen(function* () {
        const client = yield* BackendAtomRpcClient;

        return yield* client("Workspace.List", undefined);
      })
    );

    if (workspaces.length === 0) {
      throw redirect({ to: "/create-workspace" });
    }

    const lastActiveWorkspaceId = Option.getOrUndefined(
      context.session.lastActiveWorkspaceId
    );

    const targetWorkspace =
      workspaces.find((workspace) => workspace.id === lastActiveWorkspaceId) ??
      workspaces[0];

    throw redirect({
      to: "/$workspaceSlug",
      params: {
        workspaceSlug: targetWorkspace.slug,
      },
    });
  },
});
