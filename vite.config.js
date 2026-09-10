import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { onRequestGet as getWeather } from "./functions/api/weather.js";
import { onRequestGet as getStorms } from "./functions/api/storms.js";
import { onRequestGet as getGeocode } from "./functions/api/geocode.js";
import { onRequestGet as getOutlook } from "./functions/api/outlook.js";
import { onRequestGet as getNhc } from "./functions/api/nhc.js";
import { onRequestGet as getFires } from "./functions/api/fires.js";
import { onRequestGet as getSpc } from "./functions/api/spc.js";
import { onRequestGet as getLightning } from "./functions/api/lightning.js";

function mountApi(server, route, handler, env) {
  server.middlewares.use(route, async (req, res) => {
    try {
      const request = new Request(`http://localhost${req.url}`, { method: req.method });
      const response = await handler({ request, env });
      res.statusCode = response.status;
      response.headers.forEach((value, key) => res.setHeader(key, value));
      res.end(await response.text());
    } catch {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "API proxy failed" }));
    }
  });
}

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

      mountApi(server, "/api/weather", getWeather, workerEnv);
      mountApi(server, "/api/storms", getStorms, workerEnv);
      mountApi(server, "/api/nhc", getNhc, workerEnv);
      mountApi(server, "/api/fires", getFires, workerEnv);
      mountApi(server, "/api/spc", getSpc, workerEnv);
      mountApi(server, "/api/lightning", getLightning, workerEnv);
      mountApi(server, "/api/geocode", getGeocode, workerEnv);
      mountApi(server, "/api/outlook", getOutlook, workerEnv);
    },
  };
}

export default defineConfig(({ mode }) => ({
  logLevel: "error",
  plugins: [react(), weatherDevProxy(mode)],
  optimizeDeps: {
    entries: ["index.html", "src/**/*.{js,jsx}"],
  },
  server: {
    fs: {
      deny: ["**/Ventoy/**"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
