import { createFileRoute } from "@tanstack/react-router";

import { Calendar } from "./-components/calendar";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Calendar />;
}
