import type { WorkspaceMemberId } from "@recount/core/shared/schemas";
import { Avatar, AvatarFallback, AvatarImage } from "@recount/ui/avatar";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { Option } from "effect";

import { useWorkspaceDb } from "~/db/workspace/context";

interface WorkspaceMemberAvatarProps {
  workspaceMemberId: Option.Option<WorkspaceMemberId>;
}

export function WorkspaceMemberAvatar({
  workspaceMemberId,
}: WorkspaceMemberAvatarProps) {
  const workspaceDb = useWorkspaceDb();
  const { data: workspaceMember } = useLiveQuery((q) =>
    q
      .from({ wm: workspaceDb.collections.workspaceMembersCollection })
      .where(({ wm }) => eq(wm.id, Option.getOrNull(workspaceMemberId)))
      .findOne()
  );

  if (!workspaceMember) {
    return null;
  }

  return (
    <Avatar>
      <AvatarImage src={Option.getOrUndefined(workspaceMember.imageUrl)} />
      <AvatarFallback>{workspaceMember.displayName.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
