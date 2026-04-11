import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";

export const sessionAtom = RecountAtomRpcClient.query(
  "Auth.GetSession",
  undefined,
  {
    timeToLive: Infinity,
  }
);

export const workspacesAtom = RecountAtomRpcClient.query(
  "Workspace.List",
  undefined,
  {
    timeToLive: Infinity,
  }
);
