import * as Alchemy from "alchemy";
import * as Cloudflare from "alchemy/Cloudflare";
import * as Effect from "effect/Effect";

export default Alchemy.Stack(
  "Recount",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
  },
  Effect.gen(function* () {
    const globalUploadsBucket = yield* Cloudflare.R2Bucket("GlobalUploads", {
      locationHint: "wnam",
      storageClass: "Standard",
    });

    const euUploadsBucket = yield* Cloudflare.R2Bucket("EuUploads", {
      locationHint: "weur",
      jurisdiction: "eu",
      storageClass: "Standard",
    });

    return {
      globalUploadsBucketName: globalUploadsBucket.bucketName,
      euUploadsBucketName: euUploadsBucket.bucketName,
    };
  })
);
