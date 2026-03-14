import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
export default defineConfig({
    plugins: [react(), cloudflare()],
    build: {
        rollupOptions: {
            output: {
                manualChunks: function (id) {
                    if (!id.includes("node_modules")) {
                        return;
                    }
                    if (id.includes("/react/") ||
                        id.includes("/react-dom/") ||
                        id.includes("/scheduler/") ||
                        id.includes("/lenis/")) {
                        return "vendor";
                    }
                },
            },
        },
    },
});
