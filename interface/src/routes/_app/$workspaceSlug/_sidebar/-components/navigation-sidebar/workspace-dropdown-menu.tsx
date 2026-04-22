import { Avatar, AvatarFallback, AvatarImage } from "@recount/ui/avatar";
import { Button } from "@recount/ui/button";
import { Icons } from "@recount/ui/icons";
import {
  Menu,
  MenuGroup,
  MenuGroupLabel,
  MenuItem,
  MenuPopup,
  MenuRadioGroup,
  MenuRadioItem,
  MenuSeparator,
  MenuSub,
  MenuSubPopup,
  MenuSubTrigger,
  MenuTrigger,
} from "@recount/ui/menu";
import { Link, useNavigate, useRouteContext } from "@tanstack/react-router";

import { WorkspaceAvatar } from "~/components/workspace-avatar";

export function WorkspaceDropdownMenu() {
  const navigate = useNavigate();
  const { workspace, workspaces, user } = useRouteContext({
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
    <Menu>
      <MenuTrigger
        render={
          <Button className="max-w-full" size="sm" variant="ghost">
            <WorkspaceAvatar workspaceId={workspace.id} />
            <span className="truncate">{workspace.name}</span>
            <Icons.ChevronDown />
          </Button>
        }
      />
      <MenuPopup align="start" side="bottom">
        <MenuGroup>
          <MenuSub>
            <MenuSubTrigger>Switch workspace</MenuSubTrigger>
            <MenuSubPopup>
              <MenuRadioGroup value={workspace.id}>
                <MenuGroupLabel>{user.email}</MenuGroupLabel>
                {workspaces.map((w) => (
                  <MenuRadioItem
                    key={w.id}
                    onClick={() => handleSetActiveWorkspace(w.slug)}
                    value={w.id}
                  >
                    {w.name}
                  </MenuRadioItem>
                ))}
              </MenuRadioGroup>
              <MenuSeparator />
              <MenuGroup>
                <MenuItem render={<Link to="/create-workspace" />}>
                  <Icons.Plus />
                  Create a new workspace
                </MenuItem>
              </MenuGroup>
            </MenuSubPopup>
          </MenuSub>
        </MenuGroup>
      </MenuPopup>
    </Menu>
  );
}
