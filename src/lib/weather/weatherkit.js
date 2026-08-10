import {
  adaptWeatherKitCurrent,
  adaptWeatherKitDaily,
  adaptWeatherKitHourly,
} from "./weatherkit-adapters.js";

async function fetchWeatherKit(lat, lon, dataSets) {
  const params = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    dataSets,
  });
  const res = await fetch(`/api/weather?${params.toString()}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `WeatherKit ${res.status}`);
  }
  return res.json();
}

export async function fetchWeatherKitCurrent(lat, lon) {
  const data = await fetchWeatherKit(lat, lon, "currentWeather,forecastDaily");
  return adaptWeatherKitCurrent(data);
}

export async function fetchWeatherKitHourly(lat, lon) {
  const data = await fetchWeatherKit(lat, lon, "forecastHourly");
  return adaptWeatherKitHourly(data);
}

export async function fetchWeatherKitDaily(lat, lon) {
  const data = await fetchWeatherKit(lat, lon, "forecastDaily");
  return adaptWeatherKitDaily(data);
}
