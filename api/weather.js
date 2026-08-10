import { fetchWeatherKit, isWeatherKitConfigured } from "./_lib/weatherkit.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!isWeatherKitConfigured()) {
    return res.status(503).json({
      error: "WeatherKit is not configured",
      hint: "Set WEATHERKIT_TEAM_ID, WEATHERKIT_KEY_ID, WEATHERKIT_SERVICE_ID, and WEATHERKIT_PRIVATE_KEY",
    });
  }

  const { lat, lon, dataSets } = req.query;
  if (!lat || !lon) {
    return res.status(400).json({ error: "lat and lon are required" });
  }

  try {
    const data = await fetchWeatherKit(
      lat,
      lon,
      dataSets || "currentWeather,forecastHourly,forecastDaily"
    );
    return res.status(200).json(data);
  } catch (err) {
    return res.status(502).json({ error: err.message || "WeatherKit request failed" });
  }
}
