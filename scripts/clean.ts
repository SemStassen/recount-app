import { readdir, rm } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const targets = [
  "node_modules",
  "dist",
  ".turbo",
  "tsconfig.tsbuildinfo",
];
const workspaceDirs = ["apps", "packages"];
const standalonePackageDirs = ["interface"];
const extraTargets = [path.join("apps", "desktop", "src-tauri", "target")];

async function removeTargets(base: string) {
  await Promise.all(
    targets.map(async (target) => {
      await rm(path.join(base, target), { force: true, recursive: true });
    })
  );
}

async function readDirectories(directoryPath: string) {
  try {
    const entries = await readdir(directoryPath, { withFileTypes: true });

    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);
  } catch (error) {
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      return [];
    }
    throw error;
  }
}

await removeTargets(root);

await Promise.all(
  standalonePackageDirs.map(async (packageDir) => {
    await removeTargets(path.join(root, packageDir));
  })
);

await Promise.all(
  workspaceDirs.map(async (workspaceDir) => {
    const workspacePath = path.join(root, workspaceDir);
    const packageDirs = await readDirectories(workspacePath);

    await Promise.all(
      packageDirs.map(async (packageDir) => {
        await removeTargets(path.join(workspacePath, packageDir));
      })
    );
  })
);

await Promise.all(
  extraTargets.map(async (target) => {
    await rm(path.join(root, target), { force: true, recursive: true });
  })
);

console.log("Removed node_modules and generated dev artifacts.");
