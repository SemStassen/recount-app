import { Avatar, AvatarImage } from "@recount/ui/avatar";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/settings/integrations/_providers/linear/"
)({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div>
      <header className="flex gap-4">
        <Avatar rounded="md" size="lg">
          <AvatarImage src="/assets/integrations/linear.svg" />
        </Avatar>
        <div>
          <h2 className="font-semibold text-xl">Linear</h2>
        </div>
      </header>
    </div>
  );
}
