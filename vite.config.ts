import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import { scrapbook } from "./src/content/scrapbook";

import { cloudflare } from "@cloudflare/vite-plugin";

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

export default defineConfig({
  plugins: [{
    name: "scrapbook-html-metadata",
    transformIndexHtml(html) {
      return html
        .replace("__SCRAPBOOK_TITLE__", escapeHtml(scrapbook.title))
        .replace(
          "__SCRAPBOOK_DESCRIPTION__",
          escapeHtml(scrapbook.metadata.description),
        );
    },
  }, react(), tailwindcss(), cloudflare()],
});