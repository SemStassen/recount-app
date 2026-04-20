import { Card, CardPanel } from "@recount/ui/card";
import { createFileRoute } from "@tanstack/react-router";

import { UpdateProfileForm } from "./-components/update-profile-form";

export const Route = createFileRoute("/_app/$workspaceSlug/settings/profile/")({
  beforeLoad: () => ({
    getTitle: () => "Profile",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <Card>
      <CardPanel>
        <UpdateProfileForm />
      </CardPanel>
    </Card>
  );
}
