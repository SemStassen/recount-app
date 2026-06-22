// ast-grep-ignore: no-direct-fs-import, no-bare-new-error, no-console-log

import { access, chmod, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";

import { $ } from "bun";

const shadowVersion = "1.0.0";
const shadowAsset = `Shadow-${shadowVersion}-macos-arm64.dmg`;
const shadowUrl = `https://github.com/ghostwright/shadow/releases/download/v${shadowVersion}/${shadowAsset}`;

const targetTriples: Record<string, string> = {
  "darwin-arm64": "aarch64-apple-darwin",
};

const key = `${process.platform}-${process.arch}`;
const targetTriple = targetTriples[key];

if (!targetTriple) {
  throw new Error(
    `shadow only publishes a macOS arm64 app; unsupported ${key}`
  );
}

const scriptDir = import.meta.dirname;
const tauriDir = path.join(scriptDir, "..", "src-tauri");
const binariesDir = path.join(tauriDir, "binaries");
const resourcesDir = path.join(tauriDir, "resources");
const shadowAppPath = path.join(resourcesDir, "Shadow.app");
const sidecarPath = path.join(binariesDir, `shadow-${targetTriple}`);
const cacheDir = path.join(tauriDir, ".sidecar-cache");
const dmgPath = path.join(cacheDir, shadowAsset);

await mkdir(binariesDir, { recursive: true });
await mkdir(resourcesDir, { recursive: true });
await mkdir(cacheDir, { recursive: true });

try {
  await access(dmgPath);
} catch {
  console.log(`Downloading ${shadowUrl}`);
  await $`curl -L --fail --output ${dmgPath} ${shadowUrl}`;
}

const attachOutput =
  await $`hdiutil attach ${dmgPath} -nobrowse -readonly`.text();
const mountPoint = attachOutput
  .split("\n")
  .map(
    (line) => line.match(/\t(?<mountPoint>\/Volumes\/.+)$/u)?.groups?.mountPoint
  )
  .find(Boolean);

if (!mountPoint) {
  throw new Error("could not find mounted Shadow volume");
}

try {
  await rm(shadowAppPath, { force: true, recursive: true });
  await $`cp -R ${path.join(mountPoint, "Shadow.app")} ${shadowAppPath}`;
} finally {
  await $`hdiutil detach ${mountPoint}`;
}

await writeFile(
  sidecarPath,
  `#!/bin/sh
set -eu

SELF_DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

if [ -d "$SELF_DIR/../resources/Shadow.app" ]; then
  SHADOW_APP="$SELF_DIR/../resources/Shadow.app"
elif [ -d "$SELF_DIR/../../resources/Shadow.app" ]; then
  SHADOW_APP="$SELF_DIR/../../resources/Shadow.app"
elif [ -d "$SELF_DIR/../Resources/resources/Shadow.app" ]; then
  SHADOW_APP="$SELF_DIR/../Resources/resources/Shadow.app"
else
  echo "Shadow.app resource not found" >&2
  exit 1
fi

exec "$SHADOW_APP/Contents/MacOS/Shadow" "$@"
`
);

await chmod(sidecarPath, 0o755);

console.log(`Prepared shadow sidecar at ${sidecarPath}`);
