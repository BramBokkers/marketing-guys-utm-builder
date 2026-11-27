import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

// Keep the distributable independent of a server, module loader and asset files.
function standaloneHtml(): Plugin {
  return {
    name: "standalone-html",
    apply: "build",
    enforce: "post",
    generateBundle(_options, bundle) {
      const html = bundle["index.html"];
      if (!html || html.type !== "asset") throw new Error("Missing index.html");
      let source = String(html.source);
      source = source.replace(/<script\b[^>]*src="[^"]+"[^>]*><\/script>/g, "");
      source = source.replace(/<link\b[^>]*rel="stylesheet"[^>]*>/g, "");
      for (const [name, output] of Object.entries(bundle)) {
        if (output.type === "chunk") {
          if (!output.isEntry || output.imports.length || output.dynamicImports.length) {
            throw new Error("Standalone HTML requires one self-contained entry");
          }
          const code = output.code.replace(/<\/script/gi, "<\\/script");
          source = source.replace("</body>", () => `<script>${code}</script></body>`);
          delete bundle[name];
        } else if (name.endsWith(".css")) {
          const css = String(output.source).replace(/<\/style/gi, "<\\/style");
          source = source.replace("</head>", () => `<style>${css}</style></head>`);
          delete bundle[name];
        }
      }
      html.source = source;
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), standaloneHtml()],
  base: "./",
  build: {
    copyPublicDir: false,
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    modulePreload: false,
    rollupOptions: { output: { format: "iife", inlineDynamicImports: true } },
  },
  test: { environment: "jsdom" },
});
