import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  CreateTimeEntryCommand,
  CreateTimeEntryResult,
  DeleteTimeEntryCommand,
  DeleteTimeEntryResult,
  StartRunningTimeEntryCommand,
  StartRunningTimeEntryResult,
  StopRunningTimeEntryCommand,
  StopRunningTimeEntryResult,
  UpdateRunningTimeEntryCommand,
  UpdateRunningTimeEntryResult,
  UpdateTimeEntryCommand,
  UpdateTimeEntryResult,
} from "#api/contracts/index";
import {
  CannotUpdateRunningTimeEntryError,
  RunningTimeEntryNotFoundError,
  TimeEntryAlreadyRunningError,
  TimeEntryNotFoundError,
  TimeEntryStoppedAtBeforeStartedAtError,
} from "#modules/time/index";
import { AuthorizationError } from "#shared/authorization/index";

import { RpcSessionMiddleware, RpcWorkspaceMiddleware } from "./middleware";

export const TimeEntryRpcGroup = RpcGroup.make(
  Rpc.make("TimeEntry.Create", {
    payload: CreateTimeEntryCommand,
    success: CreateTimeEntryResult,
    error: Schema.Union([
      AuthorizationError,
      TimeEntryStoppedAtBeforeStartedAtError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("TimeEntry.Update", {
    payload: UpdateTimeEntryCommand,
    success: UpdateTimeEntryResult,
    error: Schema.Union([
      AuthorizationError,
      TimeEntryNotFoundError,
      CannotUpdateRunningTimeEntryError,
      TimeEntryStoppedAtBeforeStartedAtError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("TimeEntry.Delete", {
    payload: DeleteTimeEntryCommand,
    success: DeleteTimeEntryResult,
    error: Schema.Union([
      AuthorizationError,
      TimeEntryNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("RunningTimeEntry.Start", {
    payload: StartRunningTimeEntryCommand,
    success: StartRunningTimeEntryResult,
    error: Schema.Union([
      AuthorizationError,
      TimeEntryAlreadyRunningError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("RunningTimeEntry.Update", {
    payload: UpdateRunningTimeEntryCommand,
    success: UpdateRunningTimeEntryResult,
    error: Schema.Union([
      AuthorizationError,
      RunningTimeEntryNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("RunningTimeEntry.Stop", {
    payload: StopRunningTimeEntryCommand,
    success: StopRunningTimeEntryResult,
    error: Schema.Union([
      AuthorizationError,
      RunningTimeEntryNotFoundError,
      TimeEntryStoppedAtBeforeStartedAtError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);
