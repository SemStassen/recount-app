import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { getWorkspaceDb } from "~/db/workspace/get-workspace-db";

import { DebugSheet } from "./-components/debug-sheet";
import { WorkspaceProviders } from "./-workspace-providers";

export const Route = createFileRoute("/_app/$workspaceSlug")({
  beforeLoad: async ({ context, params }) => {
    const workspace = context.workspaces.find(
      (w) => w.slug === params.workspaceSlug
    );

    if (!workspace) {
      throw notFound();
    }

    const workspaceDb = await getWorkspaceDb(workspace.id);

    return {
      session: context.auth.session,
      user: context.auth.user,
      workspaces: context.workspaces,
      workspace,
      workspaceDb,
    };
  },
  loader: async ({ context }) => {
    await context.workspaceDb.preload();
  },
  pendingComponent: () => <div>Loading...</div>,
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <WorkspaceProviders>
      <div className="isolate h-screen w-screen overflow-hidden overscroll-none bg-background text-foreground">
        <main className="flex h-full">
          <Outlet />
        </main>
        <DebugSheet />
      </div>
    </WorkspaceProviders>
  );
}
