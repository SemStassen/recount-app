import { Stack } from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export const AppWeb = Effect.gen(function* () {
  const stack = yield* Stack;

  return yield* Cloudflare.StaticSite("app-web", {
    name: `${stack.name}-app-web-${stack.stage}`,
    ...(stack.stage === "prod" ? { domain: ["app.recount.dev"] } : {}),
    cwd: "apps/web",
    command: "bun run build",
    main: "apps/web/src/worker.ts",
    outdir: "dist",
    assetsConfig: {
      htmlHandling: "auto-trailing-slash",
      notFoundHandling: "single-page-application",
    },
  });
});

export type AppWebWorkerEnv = Cloudflare.InferEnv<
  Effect.Success<typeof AppWeb>
>;
