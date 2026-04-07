import {
  AuthRpcGroup,
  UserRpcGroup,
  WorkspaceRpcGroup,
} from "@recount/core/rpc";
import { Layer } from "effect";

import { AuthRpcGroupLayer } from "./handlers/auth";
import { UserRpcGroupLayer } from "./handlers/user";
import { UserSettingsRpcGroupLayer } from "./handlers/user-settings";
import { WorkspaceRpcGroupLayer } from "./handlers/workspace";
import { WorkspaceIntegrationRpcGroupLayer } from "./handlers/workspace-integration";

export const AllRpcsGroup = AuthRpcGroup.merge(UserRpcGroup, WorkspaceRpcGroup);

export const AllRpcsGroupLayer = Layer.mergeAll(
  AuthRpcGroupLayer,
  UserSettingsRpcGroupLayer,
  UserRpcGroupLayer,
  WorkspaceIntegrationRpcGroupLayer,
  WorkspaceRpcGroupLayer
);
