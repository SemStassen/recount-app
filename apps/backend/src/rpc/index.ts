import {
  AuthRpcGroup,
  ProjectRpcGroup,
  UserRpcGroup,
  UserSettingsRpcGroup,
  WorkspaceIntegrationRpcGroup,
  WorkspaceRpcGroup,
} from "@recount/core/rpc";
import { Layer } from "effect";

import { AuthRpcGroupLayer } from "./handlers/auth";
import { ProjectRpcGroupLayer } from "./handlers/project";
import { UserRpcGroupLayer } from "./handlers/user";
import { UserSettingsRpcGroupLayer } from "./handlers/user-settings";
import { WorkspaceRpcGroupLayer } from "./handlers/workspace";
import { WorkspaceIntegrationRpcGroupLayer } from "./handlers/workspace-integration";

export const AllRpcsGroup = AuthRpcGroup.merge(
  ProjectRpcGroup,
  UserSettingsRpcGroup,
  UserRpcGroup,
  WorkspaceIntegrationRpcGroup,
  WorkspaceRpcGroup
);

export const AllRpcsGroupLayer = Layer.mergeAll(
  AuthRpcGroupLayer,
  ProjectRpcGroupLayer,
  UserSettingsRpcGroupLayer,
  UserRpcGroupLayer,
  WorkspaceIntegrationRpcGroupLayer,
  WorkspaceRpcGroupLayer
);
