import { Avatar, AvatarFallback, AvatarImage } from "@recount/ui/avatar";

interface WorkspaceMemberAvatarProps {
  displayName: string | undefined;
  avatarUrl: string | undefined;
}

export function WorkspaceMemberAvatar({
  displayName,
  avatarUrl,
}: WorkspaceMemberAvatarProps) {
  const fallback = displayName?.trim().charAt(0).toUpperCase() || "?";
  const src = avatarUrl?.trim() || undefined;

  return (
    <Avatar>
      <AvatarImage src={src} />
      <AvatarFallback>{fallback}</AvatarFallback>
    </Avatar>
  );
}
