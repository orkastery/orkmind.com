import { defineConfig } from "astro/config";

export default defineConfig({
  output: "static",
  site: "https://orkmind.com",
  compressHTML: true,
  build: {
    inlineStylesheets: "auto",
  },
});
