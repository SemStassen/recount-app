import { createFileRoute, notFound, Outlet } from "@tanstack/react-router";

import { CommandMenu } from "~/features/command-menu";

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

    const workspaceDb = await context.workspaceDbRegistry.load({
      userId: context.user.id,
      workspaceId: workspace.id,
    });

    return {
      workspace,
      workspaceDb,
    };
  },
  pendingComponent: () => <div>Loading...</div>,
  component: WorkspaceLayout,
});

function WorkspaceLayout() {
  return (
    <WorkspaceProviders>
      <div className="grid h-full w-full overflow-hidden">
        <Outlet />
        <CommandMenu />
        {/* Dialogs */}
        <CreateProjectDialog />
        <CreateTaskDialog />
        <DebugSheet />
      </div>
    </WorkspaceProviders>
  );
}
