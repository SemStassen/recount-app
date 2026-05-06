import type { LandingWorkerEnv } from "../../../alchemy.run";

export default {
  fetch: (request: Request, env: LandingWorkerEnv) => env.ASSETS.fetch(request),
};
