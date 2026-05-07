import { BackendAtomRpcClient } from "~/lib/rpc/atom-client";

export const sessionAtom = BackendAtomRpcClient.query(
  "Auth.GetSession",
  undefined,
  {
    timeToLive: Infinity,
  }
);

export const workspacesAtom = BackendAtomRpcClient.query(
  "Workspace.List",
  undefined,
  {
    timeToLive: Infinity,
  }
);
