import * as Alchemy from "alchemy";
import { Stack } from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

const Landing = (db: Cloudflare.D1Database) =>
  Cloudflare.StaticSite(
    "landing",
    Alchemy.Stack.useSync((stack) => ({
      name: `${stack.name}-landing-${stack.stage}`,
      ...(stack.stage === "prod" ? { domain: ["recount.dev"] } : {}),
      cwd: "apps/landing",
      command: "bun run build",
      main: "apps/landing/src/worker.ts",
      outdir: "dist",
      bindings: {
        DB: db,
      },
      compatibility: {
        date: "2026-04-02",
        flags: ["nodejs_compat"],
      },
      assetsConfig: {
        runWorkerFirst: true,
      },
    }))
  );
export type LandingWorkerEnv = Cloudflare.InferEnv<
  Effect.Success<ReturnType<typeof Landing>>
>;

export type AppWebWorkerEnv = Cloudflare.InferEnv<typeof AppWeb>;
const AppWeb = Cloudflare.StaticSite(
  "app-web",
  Alchemy.Stack.useSync((stack) => ({
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
  }))
);

export default Alchemy.Stack(
  "recount",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const stack = yield* Stack;

    yield* Effect.log(stack.name);

    const globalUploadsBucket = yield* Cloudflare.R2Bucket("global-uploads", {
      name: `${stack.name}-global-uploads-${stack.stage === "prod" ? "prod" : "sandbox"}`,
      locationHint: "wnam",
      storageClass: "Standard",
    });

    const euUploadsBucket = yield* Cloudflare.R2Bucket("eu-uploads", {
      name: `${stack.name}-eu-uploads-${stack.stage === "prod" ? "prod" : "sandbox"}`,
      locationHint: "weur",
      jurisdiction: "eu",
      storageClass: "Standard",
    });

    const landingDb = yield* Cloudflare.D1Database("landing-db", {
      name: `${stack.name}-landing-${stack.stage}`,
    });

    const appWeb = yield* AppWeb;

    const landing = yield* Landing(landingDb);

    return {
      globalUploadsBucketName: globalUploadsBucket.bucketName,
      euUploadsBucketName: euUploadsBucket.bucketName,
      appWebUrl: appWeb.url,
      landingUrl: landing.url,
    };
  })
);
