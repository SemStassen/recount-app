import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import { AuthorizationError } from "#shared/authorization/index";

import {
  RpcSessionMiddleware,
  RpcWorkspaceMiddleware,
} from "../../../api/rpc/middleware";
import {
  ProjectArchivedError,
  ProjectNotFoundError,
  TaskNotFoundError,
} from "../index";
import {
  ArchiveProjectCommand,
  ArchiveProjectResult,
  ArchiveTaskCommand,
  ArchiveTaskResult,
  CreateProjectCommand,
  CreateProjectResult,
  CreateTaskResult,
  CreateTaskRpcCommand,
  UnarchiveProjectCommand,
  UnarchiveProjectResult,
  UnarchiveTaskCommand,
  UnarchiveTaskResult,
  UpdateProjectCommand,
  UpdateProjectResult,
  UpdateTaskCommand,
  UpdateTaskResult,
} from "./contracts";

export const ProjectRpcGroup = RpcGroup.make(
  Rpc.make("Project.Create", {
    payload: CreateProjectCommand,
    success: CreateProjectResult,
    error: Schema.Union([AuthorizationError, HttpApiError.InternalServerError]),
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

  Rpc.make("Project.Unarchive", {
    payload: UnarchiveProjectCommand,
    success: UnarchiveProjectResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);

export const TaskRpcGroup = RpcGroup.make(
  Rpc.make("Task.Create", {
    payload: CreateTaskRpcCommand,
    success: CreateTaskResult,
    error: Schema.Union([
      AuthorizationError,
      ProjectNotFoundError,
      ProjectArchivedError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("Task.Update", {
    payload: UpdateTaskCommand,
    success: UpdateTaskResult,
    error: Schema.Union([
      AuthorizationError,
      TaskNotFoundError,
      ProjectNotFoundError,
      ProjectArchivedError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("Task.Archive", {
    payload: ArchiveTaskCommand,
    success: ArchiveTaskResult,
    error: Schema.Union([
      AuthorizationError,
      TaskNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("Task.Unarchive", {
    payload: UnarchiveTaskCommand,
    success: UnarchiveTaskResult,
    error: Schema.Union([
      AuthorizationError,
      TaskNotFoundError,
      ProjectNotFoundError,
      ProjectArchivedError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);
