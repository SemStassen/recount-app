import { Effect } from "effect";
import { Atom } from "effect/unstable/reactivity";

import { RecountAtomRpcClient } from "~/lib/rpc/atom-client";

import { atomRuntime } from "./runtime";

export const sessionAtom = RecountAtomRpcClient.query(
  "Auth.GetSession",
  undefined,
  {
    timeToLive: Infinity,
  }
);

// export const sessionAtom = atomRuntime
//   .atom(
//     Effect.gen(function* () {
//       const client = yield* RecountAtomRpcClient;

//       return yield* client("Auth.GetSession", undefined);
//     })
//   )
//   .pipe(Atom.keepAlive);

export const workspacesAtom = RecountAtomRpcClient.query(
  "Workspace.List",
  undefined,
  {
    timeToLive: Infinity,
  }
);
