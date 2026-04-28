import { Avatar, AvatarFallback, AvatarImage } from "@recount/ui/avatar";
import { Option } from "effect";

interface WorkspaceMemberAvatarProps {
  displayName: Option.Option<string>;
  avatarUrl: Option.Option<string>;
}

export function WorkspaceMemberAvatar({
  displayName,
  avatarUrl,
}: WorkspaceMemberAvatarProps) {
  return (
    <Avatar>
      <AvatarImage src={avatarUrl.valueOrUndefined} />
      <AvatarFallback>{displayName.valueOrUndefined?.charAt(0)}</AvatarFallback>
    </Avatar>
  );
}
