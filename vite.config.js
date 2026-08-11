import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  logLevel: "error",
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    proxy: {
      "/api/getActiveStorms": {
        target: "https://www.nhc.noaa.gov",
        changeOrigin: true,
        rewrite: () => "/CurrentStorms.json",
        headers: { "User-Agent": "YouNeeKProRadar/1.0" },
      },
    },
  },
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    proxy: {
      "/api/getActiveStorms": {
        target: "https://www.nhc.noaa.gov",
        changeOrigin: true,
        rewrite: () => "/CurrentStorms.json",
        headers: { "User-Agent": "YouNeeKProRadar/1.0" },
      },
    },
  },
});
