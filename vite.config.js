import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { onRequestGet as getWeather } from "./functions/api/weather.js";

function weatherDevProxy(mode) {
  return {
    name: "weather-dev-proxy",
    configureServer(server) {
      const env = loadEnv(mode, process.cwd(), "");
      const workerEnv = {
        WEATHERKIT_TEAM_ID: env.WEATHERKIT_TEAM_ID,
        WEATHERKIT_KEY_ID: env.WEATHERKIT_KEY_ID,
        WEATHERKIT_SERVICE_ID: env.WEATHERKIT_SERVICE_ID,
        WEATHERKIT_PRIVATE_KEY: env.WEATHERKIT_PRIVATE_KEY,
      };

      server.middlewares.use("/api/weather", async (req, res) => {
        try {
          const request = new Request(`http://localhost${req.url}`, { method: req.method });
          const response = await getWeather({ request, env: workerEnv });
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "WeatherKit proxy failed" }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  logLevel: "error",
  plugins: [react(), weatherDevProxy(mode)],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
