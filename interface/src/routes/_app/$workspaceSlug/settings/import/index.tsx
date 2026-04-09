import { Avatar, AvatarFallback } from "@recount/ui/avatar";
import { Badge } from "@recount/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@recount/ui/card";
import { Icons } from "@recount/ui/icons";
import { eq } from "@tanstack/react-db";
import { createFileRoute, Link } from "@tanstack/react-router";

import { useWorkspaceLiveQuery } from "~/db/workspace-collections";

export const Route = createFileRoute("/_app/$workspaceSlug/settings/import/")({
  beforeLoad: () => ({
    getTitle: () => "Import",
  }),
  component: RouteComponent,
});

const defaultDescription =
  "Connect your external time tracking tool to sync time entries, projects, and team data automatically.";

function RouteComponent() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <IntegrationCard
        description={defaultDescription}
        icon={<Icons.Company.Float />}
        provider="float"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Early />}
        provider="early"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Simplicate />}
        provider="simplicate"
      />
      <IntegrationCard
        description={defaultDescription}
        disabled={true}
        icon={<Icons.Company.Toggl />}
        provider="toggl"
      />
    </div>
  );
}

function IntegrationCard({
  provider,
  description,
  icon,
  disabled = false,
}: {
  provider: "float" | "early" | "simplicate" | "toggl";
  description: string;
  icon: React.ReactNode;
  disabled?: boolean;
}) {
  const { data: integration } = useWorkspaceLiveQuery((q, collections) =>
    q
      .from({ wi: collections.workspaceIntegrationsCollection })
      .where(({ wi }) => eq(wi.provider, provider))
      .findOne()
  );

  return (
    <Link
      disabled={disabled}
      from="/$workspaceSlug/settings/import"
      to={`/$workspaceSlug/settings/import/${provider as "float"}`}
    >
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{icon}</AvatarFallback>
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
