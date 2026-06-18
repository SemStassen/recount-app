import { Atom } from "effect/unstable/reactivity";

import type { AppRuntimeLayerOptions } from "~/lib/runtime";
import { makeAppRuntimeLayer } from "~/lib/runtime";

export const makeAppAtomRuntime = (options: AppRuntimeLayerOptions) =>
  Atom.runtime(makeAppRuntimeLayer(options));

export type AppAtomRuntime = ReturnType<typeof makeAppAtomRuntime>;
