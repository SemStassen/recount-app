import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";

import { AskRecountPopover } from "../-components/ask-recount-popover";
import { WorkspaceAppShell } from "../_sidebar/-components/app-shell";

export const Route = createFileRoute("/_app/$workspaceSlug/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  // @ts-expect-error: Temp fix
  const matches = useRouterState({ select: (s) => s.matches });

  // @ts-expect-error: Temp fix
  const matchWithTitle = [...matches]
    .toReversed()
    .find((d) => "getTitle" in d.context);

  const title =
    matchWithTitle && "getTitle" in matchWithTitle.context
      ? matchWithTitle.context.getTitle()
      : "Settings";

  return (
    <WorkspaceAppShell
      footer={<AskRecountPopover />}
      sidebar={
        <aside className="w-[240px] border-r p-4">
          <Button
            render={(props) => (
              <Link
                from="/$workspaceSlug/settings"
                to="/$workspaceSlug"
                {...props}
              >
                <Icons.ChevronLeft />
                Back to app
              </Link>
            )}
            variant="ghost"
          />
          <div>
            <Button
              render={(props) => (
                <Link
                  from="/$workspaceSlug/settings"
                  to="/$workspaceSlug/settings"
                  {...props}
                >
                  <Icons.Slider />
                  Preferences
                </Link>
              )}
              variant="ghost"
            />
            <Button
              render={(props) => (
                <Link
                  from="/$workspaceSlug/settings"
                  to="/$workspaceSlug/settings/profile"
                  {...props}
                >
                  <Icons.User />
                  Profile
                </Link>
              )}
              variant="ghost"
            />
            <Button
              render={(props) => (
                <Link
                  from="/$workspaceSlug/settings"
                  to="/$workspaceSlug/settings/integrations"
                  {...props}
                >
                  <Icons.Plugs />
                  Integrations
                </Link>
              )}
              variant="ghost"
            />
          </div>
        </aside>
      }
    >
      <div className="h-full p-1">
        <div className="relative h-full overflow-y-scroll rounded-lg border bg-card p-4">
          <div className="mx-auto mt-16 max-w-2xl space-y-8">
            <h1 className="font-medium text-2xl">{title}</h1>
            <Outlet />
          </div>
        </div>
      </div>
    </WorkspaceAppShell>
  );
}
