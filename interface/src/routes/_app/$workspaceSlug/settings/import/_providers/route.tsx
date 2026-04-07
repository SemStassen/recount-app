import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import { createFileRoute, Link, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/settings/import/_providers"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <Button
        className="absolute top-4 left-4"
        render={
          <Link
            from="/$workspaceSlug/settings/import"
            to="/$workspaceSlug/settings/import"
          />
        }
        variant="ghost"
      >
        <Icons.ArrowLeft /> Back
      </Button>
      <Outlet />
    </>
  );
}
