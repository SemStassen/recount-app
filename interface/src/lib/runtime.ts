import { Layer, ManagedRuntime } from "effect";
import { Atom } from "effect/unstable/reactivity";

import { RecountApiClient } from "./api/client";
import { RecountAtomRpcClient } from "./rpc/atom-client";
import { TracerLayer } from "./telemetry";

export const runtimeLayer = Layer.mergeAll(
  RecountApiClient.layer,
  RecountAtomRpcClient.layer,
  TracerLayer
);

/**
 * Managed runtime for imperative Effect execution.
 *
 * Uses `Atom.defaultMemoMap` so this runtime and `Atom.runtime(...)` share
 * layer memoization when they build overlapping services. That allows shared
 * dependencies to be reused instead of rebuilt independently.
 */
export const runtime = ManagedRuntime.make(runtimeLayer, {
  memoMap: Atom.defaultMemoMap,
});
