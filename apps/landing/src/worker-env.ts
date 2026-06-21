export interface LandingWorkerEnv {
  readonly ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  readonly DB: unknown;
}
