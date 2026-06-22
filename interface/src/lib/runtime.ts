import { Effect, Layer, ManagedRuntime } from "effect";
import { Atom } from "effect/unstable/reactivity";

import type { ScreenContextProvider } from "../screen-context";
import { ScreenContext, ScreenContextLayer } from "../screen-context";
import { BackendHttpApiClient } from "./api/client";
import { BackendAtomRpcClient } from "./rpc/atom-client";
import { TracerLayer } from "./telemetry";

export interface RecountInterfaceHost {
  readonly screenContextProviderLayer: Layer.Layer<ScreenContextProvider>;
}

const makeAppRuntimeLayer = (host: RecountInterfaceHost) =>
  Layer.mergeAll(
    BackendHttpApiClient.layer,
    BackendAtomRpcClient.layer,
    ScreenContextLayer.pipe(Layer.provide(host.screenContextProviderLayer)),
    TracerLayer
  );

export type AppRuntimeLayer = ReturnType<typeof makeAppRuntimeLayer>;

export type AppRuntime = ManagedRuntime.ManagedRuntime<
  Layer.Success<AppRuntimeLayer>,
  Layer.Error<AppRuntimeLayer>
>;

export interface AppRuntimeBootstrap {
  readonly runtime: AppRuntime;
  readonly runtimeLayer: AppRuntimeLayer;
}

/**
 * Managed runtime for imperative Effect execution.
 *
 * Uses `Atom.defaultMemoMap` so this runtime and `Atom.runtime(...)` share
 * layer memoization when they build overlapping services. That allows shared
 * dependencies to be reused instead of rebuilt independently.
 */

export const bootstrapAppRuntime = async (
  host: RecountInterfaceHost
): Promise<AppRuntimeBootstrap> => {
  const runtimeLayer = makeAppRuntimeLayer(host);
  const runtime = ManagedRuntime.make(runtimeLayer, {
    memoMap: Atom.defaultMemoMap,
  });

  await runtime.runPromise(
    Effect.all([BackendHttpApiClient, BackendAtomRpcClient, ScreenContext], {
      discard: true,
    })
  );

  return {
    runtime,
    runtimeLayer,
  };
};
