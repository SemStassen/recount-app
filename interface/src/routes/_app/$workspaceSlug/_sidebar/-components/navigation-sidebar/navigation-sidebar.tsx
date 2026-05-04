import { useAtomValue } from "@effect/atom-react";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import type { IconProps } from "@recount/ui/icons";
import { Link, linkOptions } from "@tanstack/react-router";

import { isNavigationSidebarOpenAtom } from "~/atoms/ui-atoms";
import { Sidebar, SidebarContent } from "~/components/sidebar";
import { m } from "~/paraglide/messages";

import { UserDropdownMenu } from "./user-dropdown-menu";
import { WorkspaceDropdownMenu } from "./workspace-dropdown-menu";

const SIDEBAR_WIDTH = 240;

const NAV_ITEMS = [
  {
    groupLabel: m.common_dashboard(),
    items: [
      linkOptions({
        to: "/$workspaceSlug",
        from: "/$workspaceSlug",
        label: "Log time",
        Icon: (props: IconProps) => <Icons.Home {...props} />,
      }),
      linkOptions({
        to: "/$workspaceSlug/projects",
        from: "/$workspaceSlug",
        label: m.project({ count: "plural" }),
        Icon: (props: IconProps) => <Icons.Folder {...props} />,
      }),
    ],
  },
];

export function NavigationSidebar() {
  const isOpen = useAtomValue(isNavigationSidebarOpenAtom);

  return (
    <Sidebar
      aria-label="Workspace navigation"
      open={isOpen}
      width={SIDEBAR_WIDTH}
    >
      <SidebarContent className="justify-between px-3 pt-2 pb-4">
        <nav className="contents">
          <div className="space-y-4">
            <div className="ml-10">
              <WorkspaceDropdownMenu />
            </div>
            {NAV_ITEMS.map(({ groupLabel, items }) => (
              <div key={groupLabel}>
                <div className="mb-2 font-medium text-xs">{groupLabel}</div>
                <ul className="space-y-0.5">
                  {items.map(({ label, Icon, to, from }) => (
                    <li key={to}>
                      <Button
                        key={to}
                        render={
                          <Link
                            className="w-full justify-start gap-2"
                            from={from}
                            to={to}
                          >
                            <Icon size={16} />
                            {label}
                          </Link>
                        }
                        size="sm"
                        variant="ghost"
                      />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="space-y-2">
            <Button
              className="w-full justify-start"
              render={(props) => (
                <Link
                  from="/$workspaceSlug"
                  to="/$workspaceSlug/settings"
                  {...props}
                >
                  <Icons.Settings /> {m.common_settings()}
                </Link>
              )}
              variant="ghost"
            />
            {/* Wrap in a div to avoid layout shift when the dropdown menu is open */}
            <div>
              <UserDropdownMenu />
            </div>
          </div>
        </nav>
      </SidebarContent>
    </Sidebar>
  );
}
