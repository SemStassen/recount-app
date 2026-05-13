import * as Alchemy from "alchemy";
import { Stack } from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

const LandingDb = Effect.gen(function* () {
  const stack = yield* Stack;

  return yield* Cloudflare.D1Database("landing-db", {
    name: `${stack.name}-landing-${stack.stage === "prod" ? "prod" : "sandbox"}`,
    migrationsDir: "./migrations",
  });
});

const Landing = Effect.gen(function* () {
  const stack = yield* Stack;

  const db = yield* LandingDb;

  const site = yield* Cloudflare.StaticSite("landing", {
    name: `${stack.name}-landing-${stack.stage}`,
    ...(stack.stage === "prod" ? { domain: ["recount.dev"] } : {}),
    cwd: ".",
    command: "bun run build",
    main: "src/worker.ts",
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
  });

  return site;
});

export default Alchemy.Stack(
  "recount-landing",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const landing = yield* Landing;

    return {
      landingUrl: landing.url,
    };
  })
);
