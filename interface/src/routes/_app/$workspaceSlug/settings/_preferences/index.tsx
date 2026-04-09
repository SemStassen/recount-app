import { createFileRoute } from "@tanstack/react-router";

import { UpdatePreferencesForm } from "./-components/update-preferences-form";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/settings/_preferences/"
)({
  beforeLoad: () => ({
    getTitle: () => "Preferences",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <UpdatePreferencesForm />
    </div>
  );
}
