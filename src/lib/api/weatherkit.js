import { WEATHERKIT_DATASETS } from "@/lib/weather/weatherkit-datasets";

const OPTIONAL_WEATHER_PARAMS = ["hourlyStart", "hourlyEnd", "dailyStart", "dailyEnd", "currentAsOf"];

export class WeatherKitNotConfiguredError extends Error {
  constructor(hint) {
    super("WeatherKit is not configured");
    this.name = "WeatherKitNotConfiguredError";
    this.hint = hint;
  }
}

export async function fetchWeatherKit(lat, lon, dataSets = WEATHERKIT_DATASETS, options = {}) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    dataSets: dataSets || WEATHERKIT_DATASETS,
  });

  for (const key of OPTIONAL_WEATHER_PARAMS) {
    if (options[key]) params.set(key, options[key]);
  }

  const response = await fetch(`/api/weather?${params.toString()}`);

  if (response.status === 503) {
    const payload = await response.json().catch(() => ({}));
    throw new WeatherKitNotConfiguredError(payload.hint);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `WeatherKit request failed (${response.status})`);
  }

  return response.json();
}
