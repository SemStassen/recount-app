import type {
  CreateWorkspaceIntegrationConnectionCommand,
  CreateWorkspaceIntegrationConnectionResult,
} from "@recount/core/contracts";
import { WorkspaceContext } from "@recount/core/shared/auth";
import { Effect } from "effect";

import { Authorization } from "#shared/authorization";

import { IntegrationModule } from "../integration-module.service";

export const createWorkspaceIntegrationConnectionFlow = Effect.fn(
  "flows.createWorkspaceIntegrationConnectionFlow"
)(function* (request: typeof CreateWorkspaceIntegrationConnectionCommand.Type) {
  const { workspaceMember, workspace } = yield* WorkspaceContext;

  const authz = yield* Authorization;

  const integrationModule = yield* IntegrationModule;

  yield* authz.ensureAllowed({
    action: "workspace:create_integration_connection",
    role: workspaceMember.role,
  });

  const createdWorkspaceIntegrationConnection =
    yield* integrationModule.createWorkspaceIntegrationConnection({
      workspaceId: workspace.id,
      createdByWorkspaceMemberId: workspaceMember.id,
      data: request,
    });

  return createdWorkspaceIntegrationConnection satisfies typeof CreateWorkspaceIntegrationConnectionResult.Type;
});
