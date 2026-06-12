import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  UpdateWorkspaceMemberCommand,
  UpdateWorkspaceMemberResult,
} from "#modules/workspace-member/api";
import { WorkspaceMemberNotFoundError } from "#modules/workspace-member/workspace-member-module.service";
import { AuthorizationError } from "#shared/authorization/index";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const WorkspaceMemberRpcGroup = RpcGroup.make(
  Rpc.make("WorkspaceMember.Update", {
    payload: UpdateWorkspaceMemberCommand,
    success: UpdateWorkspaceMemberResult,
    error: Schema.Union([
      AuthorizationError,
      WorkspaceMemberNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);
