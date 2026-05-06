import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import { defineConfig } from "astro/config";

// https://astro.build/config
// Note: Tailwind v4 is wired via PostCSS (postcss.config.mjs) rather than
// the @tailwindcss/vite plugin, which currently has a compat issue with
// Astro 6's rolldown-vite (withastro/astro#16542).
export default defineConfig({
  site: "https://recount.dev",
  integrations: [react(), sitemap()],
  redirects: {},
  vite: {
    // plugins: [tailwindcss()],
  },
});
