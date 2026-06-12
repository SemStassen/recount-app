import { Schema } from "effect";
import { HttpApiError } from "effect/unstable/httpapi";
import { Rpc, RpcGroup } from "effect/unstable/rpc";

import { AuthorizationError } from "#shared/authorization/index";

import {
  RpcSessionMiddleware,
  RpcWorkspaceMiddleware,
} from "../../../api/rpc/middleware";
import {
  TargetProjectNotFoundError,
  TargetTaskNotFoundError,
  TargetTaskProjectMismatchError,
  TimeEntryNotFoundError,
  TimeEntryStoppedAtBeforeStartedAtError,
  TimerAlreadyRunningError,
  TimerNotFoundError,
} from "../index";
import {
  CreateTimeEntryResult,
  CreateTimeEntryRpcCommand,
  DeleteTimeEntryCommand,
  DeleteTimeEntryResult,
  StartTimerResult,
  StartTimerRpcCommand,
  StopTimerCommand,
  StopTimerResult,
  UpdateTimeEntryCommand,
  UpdateTimeEntryResult,
  UpdateTimerCommand,
  UpdateTimerResult,
} from "./contracts";

export const TimeRpcGroup = RpcGroup.make(
  Rpc.make("TimeEntry.Create", {
    payload: CreateTimeEntryRpcCommand,
    success: CreateTimeEntryResult,
    error: Schema.Union([
      AuthorizationError,
      TimeEntryStoppedAtBeforeStartedAtError,
      TargetProjectNotFoundError,
      TargetTaskNotFoundError,
      TargetTaskProjectMismatchError,
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
      TargetProjectNotFoundError,
      TargetTaskNotFoundError,
      TargetTaskProjectMismatchError,
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
    payload: StartTimerRpcCommand,
    success: StartTimerResult,
    error: Schema.Union([
      AuthorizationError,
      TimerAlreadyRunningError,
      TargetProjectNotFoundError,
      TargetTaskNotFoundError,
      TargetTaskProjectMismatchError,
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
      TargetProjectNotFoundError,
      TargetTaskNotFoundError,
      TargetTaskProjectMismatchError,
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

export const TimeEntryRpcGroup = TimeRpcGroup;
