import { makeAppAtomRegistry } from "../atoms/registry";
import type { RecountInterfaceHost } from "../lib/runtime";
import { bootstrapAppRuntime } from "../lib/runtime";
import { makeWorkspaceDbRegistry } from "../modules/workspace";
import { createRecountRouter } from "../router";
import type { RecountRouterContext } from "../router";

export interface RecountInterfaceInstance {
  readonly app: RecountRouterContext;
  readonly router: ReturnType<typeof createRecountRouter>;
}

export const createRecountInterfaceInstance = async (
  host: RecountInterfaceHost
): Promise<RecountInterfaceInstance> => {
  const { runtime, runtimeLayer } = await bootstrapAppRuntime(host);
  const app = {
    atomRegistry: makeAppAtomRegistry(runtimeLayer),
    runtime,
    workspaceDbRegistry: makeWorkspaceDbRegistry(runtimeLayer),
  };

  return {
    app,
    router: createRecountRouter(app),
  };
};
