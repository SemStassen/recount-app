import { Frame, FramePanel } from "@recount/ui/frame";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$workspaceSlug/settings/profile/")({
  beforeLoad: () => ({
    getTitle: () => "Profile",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const context = Route.useRouteContext();

  return (
    <Frame>
      <FramePanel></FramePanel>
    </Frame>
  );
}
