import type { ProjectId } from "@recount/core/shared/schemas";
import { Atom } from "effect/unstable/reactivity";

export const isNavigationSidebarOpenAtom = Atom.make(true);

export const projectSidebarAtom = Atom.make<
  { mode: "create" } | { mode: "edit"; projectId: ProjectId } | null
>(null);
