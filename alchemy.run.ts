import alchemy from "alchemy";
import { R2Bucket } from "alchemy/cloudflare";

const app = await alchemy("recount");

await alchemy.run("backend", async () => {
  const globalUploadsBucket = await R2Bucket("globalUploads", {
    name: "recount-global-uploads",
    adopt: true,
    locationHint: "enam",
    domains: ["recount.dev"],
  });

  const euUploadsBucket = await R2Bucket("euUploads", {
    name: "recount-eu-uploads",
    adopt: true,
    jurisdiction: "eu",
    domains: ["recount.dev"],
  });

  return {
    globalUploadsBucket,
    euUploadsBucket,
  };
});

await app.finalize();
