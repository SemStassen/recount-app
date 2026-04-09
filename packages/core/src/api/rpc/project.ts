import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  ArchiveProjectCommand,
  ArchiveProjectResult,
  CreateProjectCommand,
  CreateProjectResult,
  RestoreProjectCommand,
  RestoreProjectResult,
  UpdateProjectCommand,
  UpdateProjectResult,
} from "#api/contracts/index";
import {
  ProjectArchivedError,
  ProjectTargetDateBeforeStartDateError,
  ProjectNotFoundError,
} from "#modules/project/index";
import { AuthorizationError } from "#shared/authorization/index";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const ProjectRpcGroup = RpcGroup.make(
  Rpc.make("Project.Create", {
    payload: CreateProjectCommand,
    success: CreateProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectTargetDateBeforeStartDateError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("Project.Update", {
    payload: UpdateProjectCommand,
    success: UpdateProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      ProjectArchivedError,
      ProjectTargetDateBeforeStartDateError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("Project.Archive", {
    payload: ArchiveProjectCommand,
    success: ArchiveProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("Project.Restore", {
    payload: RestoreProjectCommand,
    success: RestoreProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);
