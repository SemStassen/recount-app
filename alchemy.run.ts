import alchemy from "alchemy";
import { R2Bucket } from "alchemy/cloudflare";

const app = await alchemy("recount", {});

const isProd = app.stage === "prod";

await alchemy.run("uploads", async () => {
  const bucketTier = isProd ? "prod" : "sandbox";

  const cors: R2Bucket["cors"] = [
    {
      allowed: {
        origins: isProd ? ["https://recount.dev"] : ["http://localhost:8002"],
        methods: ["GET", "PUT", "HEAD"],
        headers: ["*"],
      },
    },
  ];

  const globalUploadsBucket = await R2Bucket("globalUploads", {
    name: `recount-global-uploads-${bucketTier}`,
    adopt: true,
    locationHint: "enam",
    devDomain: isProd ? false : true,
    cors,
  });

  const euUploadsBucket = await R2Bucket("euUploads", {
    name: `recount-eu-uploads-${bucketTier}`,
    adopt: true,
    jurisdiction: "eu",
    devDomain: isProd ? false : true,
    cors,
  });

  return {
    globalUploadsBucket,
    euUploadsBucket,
  };
});

await app.finalize();
