import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import {
  CreateTimeEntryCommand,
  CreateTimeEntryResult,
  DeleteTimeEntryCommand,
  DeleteTimeEntryResult,
  StartTimerCommand,
  StartTimerResult,
  StopTimerCommand,
  StopTimerResult,
  UpdateTimerCommand,
  UpdateTimerResult,
  UpdateTimeEntryCommand,
  UpdateTimeEntryResult,
} from "#api/contracts/index";
import {
  TimerNotFoundError,
  TimerAlreadyRunningError,
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

  Rpc.make("Timer.Start", {
    payload: StartTimerCommand,
    success: StartTimerResult,
    error: Schema.Union([
      AuthorizationError,
      TimerAlreadyRunningError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("Timer.Update", {
    payload: UpdateTimerCommand,
    success: UpdateTimerResult,
    error: Schema.Union([
      AuthorizationError,
      TimerNotFoundError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware),

  Rpc.make("Timer.Stop", {
    payload: StopTimerCommand,
    success: StopTimerResult,
    error: Schema.Union([
      AuthorizationError,
      TimerNotFoundError,
      TimeEntryStoppedAtBeforeStartedAtError,
      HttpApiError.InternalServerError,
    ]),
  })
    .middleware(RpcWorkspaceMiddleware)
    .middleware(RpcSessionMiddleware)
);
