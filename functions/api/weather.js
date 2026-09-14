import { fetchWeatherKit, fetchWeatherKitAttribution, isWeatherKitConfigured } from "../_lib/weatherkit.js";

const OPTIONAL_WEATHER_PARAMS = ["hourlyStart", "hourlyEnd", "dailyStart", "dailyEnd", "currentAsOf"];
let attributionCache = { value: null, expires: 0 };

async function getCachedAttribution(env) {
  if (attributionCache.value && Date.now() < attributionCache.expires) {
    return attributionCache.value;
  }
  const value = await fetchWeatherKitAttribution(env);
  attributionCache = { value, expires: Date.now() + 24 * 60 * 60 * 1000 };
  return value;
}

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!isWeatherKitConfigured(env)) {
    return Response.json(
      {
        error: "WeatherKit is not configured",
        hint: "Set WEATHERKIT_* secrets in Cloudflare or .env for local dev — see WEATHERKIT.md",
      },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const dataSets = url.searchParams.get("dataSets");
  const options = {};
  for (const key of OPTIONAL_WEATHER_PARAMS) {
    const value = url.searchParams.get(key);
    if (value) options[key] = value;
  }

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const [data, attribution] = await Promise.all([
      fetchWeatherKit(env, lat, lon, dataSets || undefined, options),
      getCachedAttribution(env).catch(() => null),
    ]);
    return Response.json(
      { ...data, attribution },
      {
        headers: {
          "Cache-Control": "public, max-age=300",
        },
      }
    );
  } catch (err) {
    return Response.json({ error: err.message || "WeatherKit request failed" }, { status: 502 });
  }
}
