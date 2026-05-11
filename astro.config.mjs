import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  integrations: [icon(), react(), sitemap()],
  site: "https://www.galvez1519.com",
  adapter: vercel(),
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
});
