import { startupMessage } from "@recount/config/vite-plugins/startup-message.ts";
import { createInterfaceViteConfig } from "@recount/interface/vite";
import { defineConfig, mergeConfig } from "vite";

export default mergeConfig(
  createInterfaceViteConfig(),
  defineConfig({
    root: "src",
    envDir: "..",
    clearScreen: false,
    resolve: {
      tsconfigPaths: true,
    },
    server: {
      port: 8002,
    },
    optimizeDeps: {
      exclude: [],
    },
    worker: {
      format: "es",
    },
    define: {
      __PLATFORM__: JSON.stringify("web"),
    },
    build: {
      outDir: "../dist",
    },
    plugins: [
      startupMessage({
        messages: [
          "🚀 Web server running",
          "Accessible via: http://web.recount.localhost",
        ],
      }),
    ],
  })
);
