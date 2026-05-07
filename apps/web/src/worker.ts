import type { AppWebWorkerEnv } from "../../../alchemy.run";

export default {
  fetch: (request: Request, env: AppWebWorkerEnv) => env.ASSETS.fetch(request),
};
