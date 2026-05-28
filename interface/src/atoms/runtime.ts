import { Atom } from "effect/unstable/reactivity";

import { appRuntimeLayer } from "~/lib/runtime";

export const atomRuntime = Atom.runtime(appRuntimeLayer);
