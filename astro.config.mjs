import { defineConfig } from "astro/config";
import { baseDoAmbiente } from "./src/lib/previa.mjs";

export default defineConfig({
  // Produção na raiz; prévia de release em /releasevalidation/<release>/ (SITE_BASE, ver src/lib/previa.mjs).
  base: baseDoAmbiente(),
  output: "static",
  site: "https://orkmind.com",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
});
