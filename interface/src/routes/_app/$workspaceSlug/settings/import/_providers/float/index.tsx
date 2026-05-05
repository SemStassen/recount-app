import { Frame, FrameHeader, FramePanel, FrameTitle } from "@recount/ui/frame";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { createFileRoute } from "@tanstack/react-router";
// import { RecountAtomClient } from "~/lib/rpc/atom-client";

import { useWorkspaceDb } from "~/db/workspace/context";

import { CreateWorkspaceIntegrationConnectionForm } from "../-components/create-workspace-integration-connection-form";

export const Route = createFileRoute(
  "/_app/$workspaceSlug/settings/import/_providers/float/"
)({
  beforeLoad: () => ({
    getTitle: () => "Float",
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const workspaceDb = useWorkspaceDb();
  const { data: integration } = useLiveQuery((q) =>
    q
      .from({
        wi: workspaceDb.collections.workspaceIntegrationConnectionsCollection,
      })
      .where(({ wi }) => eq(wi.provider, "float"))
      .findOne()
  );
  // const workspaceIntegrationConnections = useAtomValue(workspaceIntegrationConnectionsAtom);
  // const integration = workspaceIntegrationConnections.find((i) => i.provider === "float");

  // const syncProjects = useAtomSet(
  //   RecountAtomClient.mutation("FloatWorkspaceIntegrationConnection", "Sync"),
  //   {
  //     mode: "promise",
  //   }
  // );

  // const handleSyncProjects = () => {
  //   startTransition(async () => {
  //     await syncProjects({
  //       reactivityKeys: ["workspaceIntegrationConnections"],
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
              {/* <DisconnectWorkspaceIntegrationConnectionButton
                integrationId={integration?.id}
              /> */}
            </div>
          ) : (
            <FrameTitle>Connect</FrameTitle>
          )}
        </FrameHeader>
        {!integration && (
          <FramePanel>
            <CreateWorkspaceIntegrationConnectionForm provider="float" />
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

// function DisconnectWorkspaceIntegrationConnectionButton({
//   integrationId,
// }: {
//   integrationId: string;
// }) {
//   const deleteWorkspaceIntegrationConnection = useAtomSet(
//     deleteWorkspaceIntegrationConnectionAtom(integrationId)
//   );

//   return (
//     <Button onClick={() => deleteWorkspaceIntegrationConnection()} variant="destructive">
//       Disconnect
//     </Button>
//   );
// }
