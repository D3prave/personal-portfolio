import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

import { cloudflare } from "@cloudflare/vite-plugin";

export default defineConfig({
  plugins: [react(), cloudflare()],
  build: {
    // Explicit target ensures esbuild produces output compatible with Safari 17+
    // (aligns with the CSS browserslist "last 2 Safari versions" target in package.json).
    // Using safari14 was overly conservative and created a discrepancy where the JS target
    // was 3 major versions behind the CSS target; both now target the same era.
    target: ["es2020", "chrome110", "safari17", "firefox115", "edge110"],
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) {
            return;
          }

          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/lenis/")
          ) {
            return "vendor";
          }
        },
      },
    },
  },
});
