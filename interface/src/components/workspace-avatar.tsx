import { Avatar, AvatarFallback, AvatarImage } from "@recount/ui/avatar";

interface WorkspaceAvatarProps {
  name: string;
  logoUrl: string | undefined;
}

export function WorkspaceAvatar({ name, logoUrl }: WorkspaceAvatarProps) {
  return (
    <Avatar rounded="md">
      <AvatarImage src={logoUrl} />
      <AvatarFallback>{name.slice(0, 2)}</AvatarFallback>
    </Avatar>
  );
}
