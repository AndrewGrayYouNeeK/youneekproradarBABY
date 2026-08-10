import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { weatherkitDevMiddleware } from "./api/_lib/weatherkit-dev.js";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  Object.assign(process.env, env);

  return {
    logLevel: "error",
    plugins: [
      react(),
      {
        name: "weatherkit-dev-api",
        configureServer(server) {
          server.middlewares.use(weatherkitDevMiddleware());
        },
      },
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api/getActiveStorms": {
          target: "https://www.nhc.noaa.gov",
          changeOrigin: true,
          rewrite: () => "/CurrentStorms.json",
          headers: { "User-Agent": "YouNeeKProRadar/1.0" },
        },
      },
    },
  };
});
