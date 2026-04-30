import { Card, CardPanel } from "@recount/ui/card";
import { createFileRoute } from "@tanstack/react-router";

import { UpdateUserMeForm } from "./-components/update-user-me-form";
import { UpdateWorkspaceMemberMeForm } from "./-components/update-workspace-member-me-form";

export const Route = createFileRoute("/_app/$workspaceSlug/settings/profile/")({
  beforeLoad: () => ({
    getTitle: () => "Profile",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Card>
        <CardPanel>
          <UpdateUserMeForm />
        </CardPanel>
      </Card>
      <Card>
        <CardPanel>
          <UpdateWorkspaceMemberMeForm />
        </CardPanel>
      </Card>
    </>
  );
}
