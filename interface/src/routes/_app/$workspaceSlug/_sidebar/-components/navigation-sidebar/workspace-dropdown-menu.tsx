import { Avatar, AvatarFallback, AvatarImage } from "@recount/ui/avatar";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@recount/ui/menu";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";

export function WorkspaceDropdownMenu() {
  const navigate = useNavigate();
  const { workspace, workspaces } = useRouteContext({
    from: "/_app/$workspaceSlug",
  });

  const handleSetActiveWorkspace = (workspaceSlug: string) => {
    navigate({
      to: "/$workspaceSlug",
      params: {
        workspaceSlug,
      },
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button className="max-w-full" size="sm" variant="ghost">
            <Avatar>
              <AvatarImage />
              <AvatarFallback>{workspace.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="truncate">{workspace.name}</span>
            <Icons.ChevronDown />
          </Button>
        }
      />
      <DropdownMenuContent align="start" side="bottom">
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Switch workspace</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuRadioGroup value={workspace.id}>
                {workspaces.map((w) => (
                  <DropdownMenuRadioItem
                    key={w.id}
                    onClick={() => handleSetActiveWorkspace(w.slug)}
                    value={w.id}
                  >
                    {w.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem render={<Link to="/create-workspace" />}>
                  <Icons.Plus />
                  Create a new workspace
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
