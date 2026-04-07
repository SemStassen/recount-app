import { Atom } from "effect/unstable/reactivity";

export const isNavigationSidebarOpenAtom = Atom.make(true);

export const projectSidebarAtom = Atom.make<
  { mode: "create" } | { mode: "edit"; projectId: string } | null
>(null);
