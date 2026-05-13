import * as Alchemy from "alchemy";
import { Stack } from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

import { AppWeb } from "./apps/web/alchemy";

export default Alchemy.Stack(
  "recount",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const stack = yield* Stack;

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

    const appWeb = yield* AppWeb;

    return {
      globalUploadsBucketName: globalUploadsBucket.bucketName,
      euUploadsBucketName: euUploadsBucket.bucketName,
      appWebUrl: appWeb.url,
    };
  })
);
