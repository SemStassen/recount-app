import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  UpdateWorkspaceMemberCommand,
  UpdateWorkspaceMemberResult,
} from "#api/contracts/workspace-member";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const WorkspaceMemberRpcGroup = RpcGroup.make(
  Rpc.make("WorkspaceMember.Update", {
    payload: UpdateWorkspaceMemberCommand,
    success: UpdateWorkspaceMemberResult,
    error: Schema.Union([HttpApiError.InternalServerError]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);
