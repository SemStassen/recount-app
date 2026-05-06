import * as Alchemy from "alchemy";
import { Stack } from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export type LandingWorkerEnv = Cloudflare.InferEnv<typeof Landing>;
const Landing = Cloudflare.StaticSite(
  "landing",
  Alchemy.Stack.useSync((stack) => ({
    name: `${stack.name}-landing-${stack.stage}`,
    domain: stack.stage === "prod" ? ["recount.dev"] : undefined,
    cwd: "apps/landing",
    command: "bun run build",
    main: "apps/landing/src/worker.ts",
    outdir: "dist",
    memo: {
      include: [
        "src/**",
        "astro.config.ts",
        "package.json",
        "plugins/**",
        "public/**",
        "scripts/**",
        "../bun.lock",
      ],
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

    const landing = yield* Landing;

    return {
      globalUploadsBucketName: globalUploadsBucket.bucketName,
      euUploadsBucketName: euUploadsBucket.bucketName,
      landingUrl: landing.url,
    };
  })
);
