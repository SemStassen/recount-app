import path from "node:path";

import { paraglideVitePlugin } from "@inlang/paraglide-js";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import viteReact from "@vitejs/plugin-react";
import reactCompiler from "babel-plugin-react-compiler";
import { defineConfig } from "vite";

const __dirname = import.meta.dirname;

export const createInterfaceViteConfig = () => {
  console.log({ __dirname });
  return defineConfig({
    publicDir: path.resolve(__dirname, "public"),
    plugins: [
      devtools(),
      paraglideVitePlugin({
        project: path.resolve(__dirname, "../project.inlang"),
        outdir: path.resolve(__dirname, "src/paraglide"),
      }),
      tanstackRouter({
        target: "react",
        routesDirectory: path.resolve(__dirname, "src/routes"),
        generatedRouteTree: path.resolve(__dirname, "src/routeTree.gen.ts"),
        routeFileIgnorePrefix: "-",
      }),
      tailwindcss(),
      viteReact(),
      babel({
        presets: [
          {
            // Import the compiler plugin directly so Babel doesn't resolve it from the consuming app.
            preset: () => ({
              plugins: [[reactCompiler, {}]],
            }),
            rolldown: {
              filter: {
                code: /\b[A-Z]|\buse/u,
              },
              applyToEnvironmentHook: (env: { config: { consumer: string } }) =>
                env.config.consumer === "client",
              optimizeDeps: {
                include: ["react/compiler-runtime"],
              },
            },
          },
        ],
      }),
    ],
  });
};
