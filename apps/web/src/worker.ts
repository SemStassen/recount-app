type AppWebWorkerEnv = {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
};

export default {
  fetch: (request: Request, env: AppWebWorkerEnv) => env.ASSETS.fetch(request),
};
