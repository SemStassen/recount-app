import type {
  CreateWorkspaceIntegrationConnectionCommand,
  CreateWorkspaceIntegrationConnectionResult,
} from "@recount/core/contracts";
import { Effect } from "effect";

import { ApplicationContext } from "#shared/application-context";

import { IntegrationModule } from "../integration-module.service";

export const createWorkspaceIntegrationConnectionFlow = Effect.fn(
  "flows.createWorkspaceIntegrationConnectionFlow"
)(function* (request: typeof CreateWorkspaceIntegrationConnectionCommand.Type) {
  const appContext = yield* ApplicationContext;
  const integrationModule = yield* IntegrationModule;

  const { workspaceMember, workspace } = yield* appContext.authorizedWorkspace(
    "workspace:create_integration_connection"
  );

  const createdWorkspaceIntegrationConnection =
    yield* integrationModule.createWorkspaceIntegrationConnection({
      workspaceId: workspace.id,
      createdByWorkspaceMemberId: workspaceMember.id,
      data: request,
    });

  return createdWorkspaceIntegrationConnection satisfies typeof CreateWorkspaceIntegrationConnectionResult.Type;
});
