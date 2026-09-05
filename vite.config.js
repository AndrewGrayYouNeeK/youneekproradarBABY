import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import { onRequestGet as getWeather } from "./functions/api/weather.js";
import { onRequestGet as getLightning } from "./functions/api/lightning.js";
import { onRequestGet as getPointAlerts } from "./functions/api/point-alerts.js";

const NWS_HEADERS = { Accept: "application/geo+json", "User-Agent": "YouNeeKProRadar/1.0 (alerts)" };

const ALERT_EVENTS = {
  tornado: ["Tornado Warning"],
  tornado_watch: ["Tornado Watch"],
  thunderstorm: ["Severe Thunderstorm Warning"],
  flood: ["Flood Warning", "Flash Flood Warning", "Flood Watch", "Flash Flood Watch"],
  winter: [
    "Winter Storm Warning",
    "Blizzard Warning",
    "Ice Storm Warning",
    "Winter Weather Advisory",
    "Blizzard Watch",
    "Winter Storm Watch",
  ],
};

async function fetchNwsAlerts(type) {
  const events = ALERT_EVENTS[type];
  if (!events) {
    return { status: 400, body: { error: `Unknown alert type: ${type}` } };
  }

  const features = [];
  const seen = new Set();

  for (const event of events) {
    const url = `https://api.weather.gov/alerts/active?status=actual&event=${encodeURIComponent(event)}`;
    const response = await fetch(url, { headers: NWS_HEADERS });
    if (!response.ok) continue;
    const payload = await response.json();
    for (const feature of payload?.features || []) {
      const id = feature?.id || feature?.properties?.id;
      const key = id || JSON.stringify(feature?.geometry?.coordinates?.[0]?.[0]);
      if (seen.has(key)) continue;
      seen.add(key);
      features.push(feature);
    }
  }

  return {
    status: 200,
    body: {
      type: "FeatureCollection",
      features,
      title: "Active weather alerts",
      updated: new Date().toISOString(),
    },
  };
}

function alertsDevProxy() {
  return {
    name: "alerts-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/alerts", async (req, res) => {
        try {
          const url = new URL(req.url || "", "http://localhost");
          const type = url.searchParams.get("type") || "tornado";
          const result = await fetchNwsAlerts(type);
          res.statusCode = result.status;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify(result.body));
        } catch {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ type: "FeatureCollection", features: [] }));
        }
      });
    },
  };
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

function pointAlertsDevProxy() {
  return {
    name: "point-alerts-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/point-alerts", async (req, res) => {
        try {
          const request = new Request(`http://localhost${req.url}`, { method: req.method });
          const response = await getPointAlerts({ request });
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ alerts: [] }));
        }
      });
    },
  };
}

function lightningDevProxy() {
  return {
    name: "lightning-dev-proxy",
    configureServer(server) {
      server.middlewares.use("/api/lightning", async (_req, res) => {
        try {
          const response = await getLightning();
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          res.end(await response.text());
        } catch {
          res.statusCode = 502;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ strikes: [] }));
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  logLevel: "error",
  plugins: [react(), alertsDevProxy(), weatherDevProxy(mode), pointAlertsDevProxy(), lightningDevProxy()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    headers: {
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "frame-ancestors 'none'",
    },
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
    headers: {
      "X-Frame-Options": "DENY",
      "Content-Security-Policy": "frame-ancestors 'none'",
    },
    proxy: {
      "/api/getActiveStorms": {
        target: "https://www.nhc.noaa.gov",
        changeOrigin: true,
        rewrite: () => "/CurrentStorms.json",
        headers: { "User-Agent": "YouNeeKProRadar/1.0" },
      },
    },
  },
}));
