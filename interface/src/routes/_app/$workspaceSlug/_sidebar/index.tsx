import { createFileRoute } from "@tanstack/react-router";

import { Calendar } from "~/features/calendar";

export const Route = createFileRoute("/_app/$workspaceSlug/_sidebar/")({
  component: RouteComponent,
});

function RouteComponent() {
  return <Calendar />;
}
