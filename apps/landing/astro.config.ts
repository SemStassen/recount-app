import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://recount.dev",
  integrations: [react(), sitemap()],
  redirects: {},
  vite: {
    plugins: [tailwindcss()],
  },
});
