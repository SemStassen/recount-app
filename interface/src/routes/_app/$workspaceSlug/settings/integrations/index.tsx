import type { WorkspaceIntegrationConnectionProvider } from "@recount/core/modules/integration";
import { Avatar, AvatarImage } from "@recount/ui/avatar";
import { Badge } from "@recount/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@recount/ui/card";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";

import { useWorkspaceDb } from "~/modules/workspace";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/settings/integrations/"
)({
  beforeLoad: () => ({
    getTitle: () => "Integrations",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <IntegrationCard
        description="Placeholder description"
        logoSrc="/assets/integrations/linear.svg"
        provider="linear"
      />
    </div>
  );
}

function IntegrationCard({
  provider,
  description,
  logoSrc,
  disabled = false,
}: {
  provider: typeof WorkspaceIntegrationConnectionProvider.schema.Type;
  description: string;
  logoSrc: string;
  disabled?: boolean;
}) {
  const workspaceDb = useWorkspaceDb();
  const { data: integration } = useLiveQuery((q) =>
    q
      .from({
        wi: workspaceDb.collections.workspaceIntegrationConnectionsCollection,
      })
      .where(({ wi }) => eq(wi.provider, provider))
      .findOne()
  );

  return (
    <Link
      disabled={disabled}
      from="/$workspaceSlug/settings/integrations/"
      to={`/$workspaceSlug/settings/integrations/${provider}`}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar rounded="md">
              <AvatarImage src={logoSrc} />
            </Avatar>
            <CardTitle>{provider}</CardTitle>
          </div>
          {disabled && <Badge variant="info">Coming soon</Badge>}
          {integration && <Badge variant="success">Connected</Badge>}
        </CardHeader>
        <CardContent>{description}</CardContent>
      </Card>
    </Link>
  );
}
