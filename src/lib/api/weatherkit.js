import { WEATHERKIT_DATASETS } from "@/lib/weather/weatherkit-datasets";

export class WeatherKitNotConfiguredError extends Error {
  constructor(hint) {
    super("WeatherKit is not configured");
    this.name = "WeatherKitNotConfiguredError";
    this.hint = hint;
  }
}

export async function fetchWeatherKitStatus() {
  const response = await fetch("/api/weather-status", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Could not read WeatherKit status");
  }
  return response.json();
}

export async function fetchWeatherKit(lat, lon, dataSets = WEATHERKIT_DATASETS) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    dataSets,
  });
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) params.set("timezone", timezone);
  } catch {
    /* ignore */
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
