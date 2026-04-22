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
import { Option } from "effect";

import { WorkspaceMemberAvatar } from "~/components/workspace-member-avatar";
import { useWorkspaceDb } from "~/db/workspace/context";
import { betterAuthClient } from "~/lib/better-auth";

function UserDropdownMenu() {
  const { user } = useRouteContext({
    from: "/_app/$workspaceSlug",
  });

  const workspaceDb = useWorkspaceDb();
  const { data: workspaceMember } = useLiveQuery((q) =>
    q
      .from({ wm: workspaceDb.collections.workspaceMembersCollection })
      .where(({ wm }) => eq(wm.userId, user.id))
      .select(({ wm }) => ({ id: wm.id }))
      .findOne()
  );

  const handleSignOut = async () => {
    await betterAuthClient.signOut();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="h-fit w-full py-4" variant="ghost">
            <WorkspaceMemberAvatar
              workspaceMemberId={Option.fromUndefinedOr(workspaceMember?.id)}
            />
            <div className="grid flex-1 text-start">
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

export { UserDropdownMenu };
