import { Button } from "@recount/ui/button";
import { Frame, FrameHeader, FramePanel, FrameTitle } from "@recount/ui/frame";
import { eq } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
import { useTransition } from "react";

import { useWorkspaceLiveQuery } from "~/db/use-workspace-live-query";
// import { RecountAtomClient } from "~/lib/rpc/atom-client";
import { formatter } from "~/lib/utils/date-time";

import { CreateWorkspaceIntegrationForm } from "../-components/create-workspace-integration-form";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/settings/import/_providers/float/"
)({
  beforeLoad: () => ({
    getTitle: () => "Float",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const { data: integration } = useWorkspaceLiveQuery((q, db) =>
    q
      .from({ wi: db.workspaceIntegrationsCollection })
      .where(({ wi }) => eq(wi.provider, "float"))
      .findOne()
  );
  // const workspaceIntegrations = useAtomValue(workspaceIntegrationsAtom);
  // const integration = workspaceIntegrations.find((i) => i.provider === "float");

  const [isPending, startTransition] = useTransition();
  // const syncProjects = useAtomSet(
  //   RecountAtomClient.mutation("FloatWorkspaceIntegration", "Sync"),
  //   {
  //     mode: "promise",
  //   }
  // );

  // const handleSyncProjects = () => {
  //   startTransition(async () => {
  //     await syncProjects({
  //       reactivityKeys: ["workspaceIntegrations"],
  //     });
  //   });
  // };

  return (
    <>
      <Frame>
        <FrameHeader>
          {integration ? (
            <div className="flex items-center justify-between">
              {/* <FrameTitle>
                Connected on {formatter.date(integration.createdAt)}
              </FrameTitle> */}
              {/* <DisconnectWorkspaceIntegrationButton
                integrationId={integration?.id}
              /> */}
            </div>
          ) : (
            <FrameTitle>Connect</FrameTitle>
          )}
        </FrameHeader>
        {!integration && (
          <FramePanel>
            <CreateWorkspaceIntegrationForm provider="float" />
          </FramePanel>
        )}
      </Frame>
      {integration && (
        <Frame>
          <FrameHeader>
            <FrameTitle>Settings</FrameTitle>
          </FrameHeader>
          <FramePanel>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <div>Sync all</div>
                {/* {integration._metadata?.lastSyncedAt && (
                  <div className="text-muted-foreground text-sm">
                    Last synced on{" "}
                    {formatter.dateTime(integration._metadata.lastSyncedAt)}
                  </div>
                )} */}
              </div>
              {/* <Button disabled={isPending} onClick={handleSyncProjects}>
                Sync from Float
              </Button> */}
            </div>
          </FramePanel>
        </Frame>
      )}
    </>
  );
}

// function DisconnectWorkspaceIntegrationButton({
//   integrationId,
// }: {
//   integrationId: string;
// }) {
//   const deleteWorkspaceIntegration = useAtomSet(
//     deleteWorkspaceIntegrationAtom(integrationId)
//   );

//   return (
//     <Button onClick={() => deleteWorkspaceIntegration()} variant="destructive">
//       Disconnect
//     </Button>
//   );
// }
