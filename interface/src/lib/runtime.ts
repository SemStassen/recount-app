import { Layer, ManagedRuntime } from "effect";
import { Atom } from "effect/unstable/reactivity";

import { BackendHttpApiClient } from "./api/client";
import { BackendAtomRpcClient } from "./rpc/atom-client";
import { TracerLayer } from "./telemetry";

export const appRuntimeLayer = Layer.mergeAll(
  BackendHttpApiClient.layer,
  BackendAtomRpcClient.layer,
  TracerLayer
);

/**
 * Managed runtime for imperative Effect execution.
 *
 * Uses `Atom.defaultMemoMap` so this runtime and `Atom.runtime(...)` share
 * layer memoization when they build overlapping services. That allows shared
 * dependencies to be reused instead of rebuilt independently.
 */
export const appRuntime = ManagedRuntime.make(appRuntimeLayer, {
  memoMap: Atom.defaultMemoMap,
});
