import {
  AuthRpcGroup,
  FileUploadRpcGroup,
  ProjectRpcGroup,
  TaskRpcGroup,
  TimeEntryRpcGroup,
  UserRpcGroup,
  UserSettingsRpcGroup,
  WorkspaceIntegrationConnectionRpcGroup,
  WorkspaceInvitationRpcGroup,
  WorkspaceMemberRpcGroup,
  WorkspaceRpcGroup,
} from "@recount/core/rpc";
import { Layer } from "effect";

import { AuthRpcGroupLayer } from "./handlers/auth";
import { FileUploadRpcGroupLayer } from "./handlers/file-upload";
import { ProjectRpcGroupLayer } from "./handlers/project";
import { TaskRpcGroupLayer } from "./handlers/task";
import { TimeEntryRpcGroupLayer } from "./handlers/time-entry";
import { UserRpcGroupLayer } from "./handlers/user";
import { UserSettingsRpcGroupLayer } from "./handlers/user-settings";
import { WorkspaceRpcGroupLayer } from "./handlers/workspace";
import { WorkspaceIntegrationConnectionRpcGroupLayer } from "./handlers/workspace-integration-connection";
import { WorkspaceInvitationRpcGroupLayer } from "./handlers/workspace-invitation";
import { WorkspaceMemberRpcGroupLayer } from "./handlers/workspace-member";
import {
  RpcCauseLoggingMiddleware,
  RpcCauseLoggingMiddlewareLayer,
} from "./middleware";

export const AllRpcsGroup = AuthRpcGroup.merge(
  FileUploadRpcGroup,
  ProjectRpcGroup,
  TaskRpcGroup,
  TimeEntryRpcGroup,
  UserSettingsRpcGroup,
  UserRpcGroup,
  WorkspaceRpcGroup,
  WorkspaceIntegrationConnectionRpcGroup,
  WorkspaceInvitationRpcGroup,
  WorkspaceMemberRpcGroup
).middleware(RpcCauseLoggingMiddleware);

export const AllRpcsGroupLayer = Layer.mergeAll(
  AuthRpcGroupLayer,
  FileUploadRpcGroupLayer,
  ProjectRpcGroupLayer,
  TaskRpcGroupLayer,
  TimeEntryRpcGroupLayer,
  UserSettingsRpcGroupLayer,
  UserRpcGroupLayer,
  WorkspaceRpcGroupLayer,
  WorkspaceIntegrationConnectionRpcGroupLayer,
  WorkspaceInvitationRpcGroupLayer,
  WorkspaceMemberRpcGroupLayer,
  RpcCauseLoggingMiddlewareLayer
);
