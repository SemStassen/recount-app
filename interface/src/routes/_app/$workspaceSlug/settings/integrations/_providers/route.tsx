import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/settings/integrations/_providers"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <div>
        <Button
          variant="ghost"
          render={
            <Link
              from={Route.fullPath}
              to="/$workspaceSlug/settings/integrations"
            >
              <Icons.ChevronLeft />
              Integrations
            </Link>
          }
        />
      </div>
      <Outlet />
    </>
  );
}
