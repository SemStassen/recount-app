import type { WorkspaceId } from "@recount/core/shared/schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@recount/ui/avatar";
import { useRouteContext } from "@tanstack/react-router";
import { Option } from "effect";

interface WorkspaceAvatarProps {
  workspaceId: WorkspaceId;
}

export function WorkspaceAvatar({ workspaceId }: WorkspaceAvatarProps) {
  const { workspaces } = useRouteContext({ from: "/_app" });

  const workspace = workspaces.find((w) => w.id === workspaceId);

  if (!workspace) {
    return null;
  }

  return (
    <Avatar rounded="md">
      <AvatarImage src={Option.getOrUndefined(workspace.logoUrl)} />
      <AvatarFallback>{workspace.name.slice(0, 2)}</AvatarFallback>
    </Avatar>
  );
}
