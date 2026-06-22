import { scheduleTask } from "@effect/atom-react";
import { Atom, AtomRegistry } from "effect/unstable/reactivity";

import type { AppRuntimeLayer } from "~/lib/runtime";

export const makeAppAtomRegistry = (runtimeLayer: AppRuntimeLayer) => {
  const registry = AtomRegistry.make({ scheduleTask });

  registry.mount(Atom.runtime(runtimeLayer));

  return registry;
};

export type AppAtomRegistry = ReturnType<typeof makeAppAtomRegistry>;
