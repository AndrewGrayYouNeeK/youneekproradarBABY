import { fetchNwsPointAlerts } from "@/lib/api/nwsAlerts";
import { fetchOpenMeteoForecast } from "@/lib/api/openMeteoForecast";
import { fetchWeatherKit } from "@/lib/api/weatherkit";
import {
  adaptWeatherKitAlerts,
  adaptWeatherKitCurrent,
  adaptWeatherKitDaily,
  adaptWeatherKitHourly,
  adaptWeatherKitNextHour,
} from "@/lib/weather/weatherkit-adapters";

export async function fetchForecastBundle(lat, lon) {
  const nwsPromise = fetchNwsPointAlerts(lat, lon).catch(() => []);

  let source = "open-meteo";
  let current = null;
  let hourly = [];
  let daily = [];
  let nextHour = [];
  let kitAlerts = [];
  let weatherkitError = null;
  let weatherkitConfigured = true;
  let attributionUrl = "https://developer.apple.com/weatherkit/data-source-attribution/";

  try {
    const data = await fetchWeatherKit(lat, lon);
    source = "weatherkit";
    current = adaptWeatherKitCurrent(data);
    hourly = adaptWeatherKitHourly(data);
    daily = adaptWeatherKitDaily(data);
    nextHour = adaptWeatherKitNextHour(data);
    kitAlerts = adaptWeatherKitAlerts(data);
    attributionUrl =
      data?.currentWeather?.metadata?.attributionURL ||
      current?.current?.attribution_url ||
      attributionUrl;
  } catch (err) {
    weatherkitConfigured = err?.name !== "WeatherKitNotConfiguredError";
    weatherkitError = err?.hint || err?.message || "WeatherKit unavailable";
    const fallback = await fetchOpenMeteoForecast(lat, lon);
    source = "open-meteo";
    current = fallback.current;
    hourly = fallback.hourly;
    daily = fallback.daily;
    nextHour = fallback.nextHour;
  }

  const nwsAlerts = await nwsPromise;
  const alerts = kitAlerts.length ? kitAlerts : nwsAlerts;

  return {
    source,
    current,
    hourly,
    daily,
    nextHour,
    alerts,
    weatherkitError,
    weatherkitConfigured,
    attributionUrl,
  };
}
