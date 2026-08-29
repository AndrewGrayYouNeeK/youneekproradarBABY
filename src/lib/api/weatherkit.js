export class WeatherKitNotConfiguredError extends Error {
  constructor(hint) {
    super("WeatherKit is not configured");
    this.name = "WeatherKitNotConfiguredError";
    this.hint = hint;
  }
}

export async function fetchWeatherKit(lat, lon, dataSets = "currentWeather,forecastHourly,forecastDaily") {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    dataSets,
  });

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
