import tailwindcss from "@tailwindcss/vite";
import icon from "astro-icon";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import vercel from "@astrojs/vercel";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { defineConfig, envField } from "astro/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  prefetch: true,
  integrations: [icon(), react(), sitemap()],
  site: "https://www.galvez1519.com",
  adapter: vercel(),
  output: "server",
  vite: {
    plugins: [tailwindcss()],
  },
  env: {
    schema: {
      R2_ACCOUNT_ID: envField.string({ context: "server", access: "secret" }),
      R2_BUCKET_NAME: envField.string({ context: "server", access: "secret" }),
      R2_ENDPOINT: envField.string({ context: "server", access: "secret" }),
      R2_PUBLIC_URL: envField.string({ context: "server", access: "secret" }),
      R2_ACCESS_KEY_ID: envField.string({ context: "server", access: "secret" }),
      R2_SECRET_ACCESS_KEY: envField.string({ context: "server", access: "secret" }),
    },
  },
});
