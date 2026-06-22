import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  CreateWorkspaceIntegrationConnectionCommand,
  CreateWorkspaceIntegrationConnectionResult,
} from "#modules/integration/api";
import { WorkspaceIntegrationConnectionProviderAlreadyExistsError } from "#modules/integration/index";
import { AuthorizationError } from "#shared/authorization/index";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const WorkspaceIntegrationConnectionRpcGroup = RpcGroup.make(
  Rpc.make("WorkspaceIntegrationConnection.Create", {
    payload: CreateWorkspaceIntegrationConnectionCommand,
    success: CreateWorkspaceIntegrationConnectionResult,
    error: Schema.Union([
      AuthorizationError,
      WorkspaceIntegrationConnectionProviderAlreadyExistsError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);
