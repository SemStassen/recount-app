import {
  AuthRpcGroup,
  FileUploadRpcGroup,
  ProjectRpcGroup,
  UserRpcGroup,
  UserSettingsRpcGroup,
  WorkspaceIntegrationRpcGroup,
  WorkspaceMemberRpcGroup,
  WorkspaceRpcGroup,
} from "@recount/core/rpc";
import { Layer } from "effect";

import { AuthRpcGroupLayer } from "./handlers/auth";
import { FileUploadRpcGroupLayer } from "./handlers/file-upload";
import { ProjectRpcGroupLayer } from "./handlers/project";
import { UserRpcGroupLayer } from "./handlers/user";
import { UserSettingsRpcGroupLayer } from "./handlers/user-settings";
import { WorkspaceRpcGroupLayer } from "./handlers/workspace";
import { WorkspaceIntegrationRpcGroupLayer } from "./handlers/workspace-integration";
import { WorkspaceMemberRpcGroupLayer } from "./handlers/workspace-member";

export const AllRpcsGroup = AuthRpcGroup.merge(
  FileUploadRpcGroup,
  ProjectRpcGroup,
  UserSettingsRpcGroup,
  UserRpcGroup,
  WorkspaceIntegrationRpcGroup,
  WorkspaceRpcGroup,
  WorkspaceMemberRpcGroup
);

export const AllRpcsGroupLayer = Layer.mergeAll(
  AuthRpcGroupLayer,
  FileUploadRpcGroupLayer,
  ProjectRpcGroupLayer,
  UserSettingsRpcGroupLayer,
  UserRpcGroupLayer,
  WorkspaceIntegrationRpcGroupLayer,
  WorkspaceRpcGroupLayer,
  WorkspaceMemberRpcGroupLayer
);
