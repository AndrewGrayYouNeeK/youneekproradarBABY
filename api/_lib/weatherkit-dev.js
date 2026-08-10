import { fetchWeatherKit, isWeatherKitConfigured } from "./weatherkit.js";

export function weatherkitDevMiddleware() {
  return async (req, res, next) => {
    if (!req.url?.startsWith("/api/weather")) return next();

    if (!isWeatherKitConfigured()) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "WeatherKit is not configured",
          hint: "Add Apple Developer credentials to .env — see .env.example",
        })
      );
      return;
    }

    const url = new URL(req.url, "http://localhost");
    const lat = url.searchParams.get("lat");
    const lon = url.searchParams.get("lon");
    const dataSets = url.searchParams.get("dataSets");

    if (!lat || !lon) {
      res.statusCode = 400;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "lat and lon are required" }));
      return;
    }

    try {
      const data = await fetchWeatherKit(lat, lon, dataSets || undefined);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    } catch (err) {
      res.statusCode = 502;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: err.message || "WeatherKit request failed" }));
    }
  };
}
