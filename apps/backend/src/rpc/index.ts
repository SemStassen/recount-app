import {
  AuthRpcGroup,
  FileUploadRpcGroup,
  ProjectRpcGroup,
  TaskRpcGroup,
  TimeEntryRpcGroup,
  UserRpcGroup,
  UserSettingsRpcGroup,
  WorkspaceIntegrationConnectionRpcGroup,
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
import { WorkspaceMemberRpcGroupLayer } from "./handlers/workspace-member";

export const AllRpcsGroup = AuthRpcGroup.merge(
  FileUploadRpcGroup,
  ProjectRpcGroup,
  TaskRpcGroup,
  TimeEntryRpcGroup,
  UserSettingsRpcGroup,
  UserRpcGroup,
  WorkspaceIntegrationConnectionRpcGroup,
  WorkspaceRpcGroup,
  WorkspaceMemberRpcGroup
);

export const AllRpcsGroupLayer = Layer.mergeAll(
  AuthRpcGroupLayer,
  FileUploadRpcGroupLayer,
  ProjectRpcGroupLayer,
  TaskRpcGroupLayer,
  TimeEntryRpcGroupLayer,
  UserSettingsRpcGroupLayer,
  UserRpcGroupLayer,
  WorkspaceIntegrationConnectionRpcGroupLayer,
  WorkspaceRpcGroupLayer,
  WorkspaceMemberRpcGroupLayer
);
