import type { AppWebWorkerEnv } from "../alchemy";

export default {
  fetch: (request: Request, env: AppWebWorkerEnv) => env.ASSETS.fetch(request),
};
