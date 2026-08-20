import react from "@vitejs/plugin-react";
import path from "node:path";
import { defineConfig } from "vite";

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

export default defineConfig({
  logLevel: "error",
  plugins: [react(), alertsDevProxy()],
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
});
