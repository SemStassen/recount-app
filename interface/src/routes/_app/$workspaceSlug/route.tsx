import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { getWorkspaceDb } from "~/db/workspace/get-workspace-db";
import { CommandMenu } from "~/features/command-menu";

import { AskRecountPopover } from "./-components/ask-recount-popover";
import { CreateProjectDialog } from "./-components/create-project-dialog";
import { CreateTaskDialog } from "./-components/create-task-dialog";
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

    const workspaceDb = await getWorkspaceDb(workspace.id, context.user.id);

    return {
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
      <div className="flex flex-row w-full h-full min-h-full items-stretch">
        <div className="flex flex-col flex-1">
          <main className="flex flex-1">
            <Outlet />
          </main>
          <footer className="h-7">
            <AskRecountPopover />
          </footer>
        </div>
        <CommandMenu />
        {/* Dialogs */}
        <CreateProjectDialog />
        <CreateTaskDialog />
        <DebugSheet />
      </div>
    </WorkspaceProviders>
  );
}
