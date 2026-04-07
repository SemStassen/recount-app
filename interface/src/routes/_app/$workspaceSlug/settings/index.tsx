import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_app/$workspaceSlug/settings/")({
  beforeLoad: () => ({
    getTitle: () => "Preferences",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return <div></div>;
}
