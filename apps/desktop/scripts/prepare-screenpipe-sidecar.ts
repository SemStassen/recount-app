// ast-grep-ignore: no-direct-fs-import, no-bare-new-error, no-console-log

import { chmod, copyFile, mkdir } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);

const platformPackages: Record<string, string> = {
  "darwin-arm64": "@screenpipe/cli-darwin-arm64",
  "darwin-x64": "@screenpipe/cli-darwin-x64",
  "linux-x64": "@screenpipe/cli-linux-x64",
  "win32-x64": "@screenpipe/cli-win32-x64",
};

const targetTriples: Record<string, string> = {
  "darwin-arm64": "aarch64-apple-darwin",
  "darwin-x64": "x86_64-apple-darwin",
  "linux-x64": "x86_64-unknown-linux-gnu",
  "win32-x64": "x86_64-pc-windows-msvc",
};

const key = `${process.platform}-${process.arch}`;
const packageName = platformPackages[key];
const targetTriple = targetTriples[key];

if (!packageName || !targetTriple) {
  throw new Error(`screenpipe does not publish a sidecar binary for ${key}`);
}

const packageJsonPath = require.resolve(`${packageName}/package.json`);
const binaryExtension = process.platform === "win32" ? ".exe" : "";
const sourcePath = join(
  dirname(packageJsonPath),
  "bin",
  `screenpipe${binaryExtension}`
);

const scriptDir = dirname(fileURLToPath(import.meta.url));
const binariesDir = join(scriptDir, "..", "src-tauri", "binaries");
const destinationPath = join(
  binariesDir,
  `screenpipe-${targetTriple}${binaryExtension}`
);

await mkdir(binariesDir, { recursive: true });
await copyFile(sourcePath, destinationPath);

if (process.platform !== "win32") {
  await chmod(destinationPath, 0o755);
}

console.log(`Prepared screenpipe sidecar at ${destinationPath}`);
