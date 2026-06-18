import { scheduleTask } from "@effect/atom-react";
import { AtomRegistry } from "effect/unstable/reactivity";

import type { AppRuntimeLayerOptions } from "~/lib/runtime";
import { makeAppAtomRuntime } from "./runtime";

export const makeAppAtomRegistry = (options: AppRuntimeLayerOptions) => {
  const registry = AtomRegistry.make({ scheduleTask });

  registry.mount(makeAppAtomRuntime(options));

  return registry;
};

export type AppAtomRegistry = ReturnType<typeof makeAppAtomRegistry>;
