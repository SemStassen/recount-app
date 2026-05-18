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
import {
  FetchHttpClient,
  HttpClient,
  HttpClientError,
} from "effect/unstable/http";
import { AtomRpc, Reactivity } from "effect/unstable/reactivity";
import { RpcClient, RpcSerialization } from "effect/unstable/rpc";

import { RpcSessionMiddlewareLayerClient } from "./middleware";

const allRpcGroups = AuthRpcGroup.merge(
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
);

const RpcFetchHttpClientLayer = FetchHttpClient.layer.pipe(
  Layer.provide(
    Layer.mergeAll(
      Layer.succeed(HttpClient.TracerPropagationEnabled, false),
      Layer.succeed(FetchHttpClient.RequestInit, {
        credentials: "include",
      })
    )
  )
);

const RpcProtocolHttpLayer = RpcClient.layerProtocolHttp({
  url: `${import.meta.env.VITE_BACKEND_URL}/rpc`,
  transformClient: (client) =>
    client.pipe(
      HttpClient.retry({
        times: 3,
        // Only retry server errors (5xx), not client errors (4xx) like 401/403
        while: (error) => {
          if (HttpClientError.isHttpClientError(error)) {
            const status = error.response?.status;
            return status === undefined || (status >= 500 && status < 600);
          }
          return false;
        },
      })
    ),
}).pipe(
  Layer.provide(RpcFetchHttpClientLayer),
  Layer.provide(RpcSerialization.layerNdjson)
);

const AtomRpcProtocolLayer = Layer.mergeAll(
  RpcProtocolHttpLayer,
  RpcSessionMiddlewareLayerClient,
  Reactivity.layer
);

export class BackendAtomRpcClient extends AtomRpc.Service<BackendAtomRpcClient>()(
  "@recount/interface/BackendAtomRpcClient",
  {
    group: allRpcGroups,
    protocol: AtomRpcProtocolLayer,
  }
) {
  static readonly layer = Layer.effect(
    BackendAtomRpcClient,
    RpcClient.make(allRpcGroups, { flatten: true })
  ).pipe(Layer.provide(AtomRpcProtocolLayer));
}
