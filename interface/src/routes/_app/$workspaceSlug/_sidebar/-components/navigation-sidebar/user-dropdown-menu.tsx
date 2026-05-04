import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@recount/ui/menu";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { Link, useRouteContext } from "@tanstack/react-router";

import { WorkspaceMemberAvatar } from "~/components/workspace-member-avatar";
import { useWorkspaceDb } from "~/db/workspace/context";
import { betterAuthClient } from "~/lib/better-auth";

export function UserDropdownMenu() {
  const { user } = useRouteContext({
    from: "/_app/$workspaceSlug",
  });

  const workspaceDb = useWorkspaceDb();
  const { data: workspaceMember } = useLiveQuery((q) =>
    q
      .from({ wm: workspaceDb.collections.workspaceMembersCollection })
      .where(({ wm }) => eq(wm.userId, user.id))
      .findOne()
  );

  const handleSignOut = async () => {
    await betterAuthClient.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="w-full" variant="ghost">
            <WorkspaceMemberAvatar
              displayName={workspaceMember?.displayName}
              avatarUrl={workspaceMember?.avatarUrl.valueOrUndefined}
            />
            <div className="grid flex-1 text-start -space-y-0.5">
              <div className="truncate text-sm">{user.fullName}</div>
              <div className="truncate font-normal text-xs">{user.email}</div>
            </div>
            <Icons.ChevronsUpDown />
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="right">
        <DropdownMenuGroup>
          <DropdownMenuItem
            render={
              <Link
                from="/$workspaceSlug"
                to="/$workspaceSlug/settings/profile"
              />
            }
          >
            <Icons.User />
            Profile settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem
            nativeButton={true}
            render={<button onClick={handleSignOut} type="button" />}
          >
            <Icons.SignOut />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
