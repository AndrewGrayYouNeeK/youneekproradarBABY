import { fetchWeatherKit, WeatherKitNotConfiguredError } from "@/lib/api/weatherkit";
import {
  adaptOpenMeteoCurrent,
  adaptOpenMeteoDaily,
  adaptOpenMeteoHourly,
  adaptOpenMeteoNextHour,
  fetchOpenMeteoAir,
  fetchOpenMeteoForecast,
} from "@/lib/api/openMeteo";
import {
  adaptWeatherKitAlerts,
  adaptWeatherKitCurrent,
  adaptWeatherKitDaily,
  adaptWeatherKitHourly,
  adaptWeatherKitNextHour,
} from "@/lib/weather/weatherkit-adapters";

export async function fetchForecastBundle(lat, lon) {
  try {
    const data = await fetchWeatherKit(lat, lon);
    return {
      source: "weatherkit",
      current: adaptWeatherKitCurrent(data),
      hourly: adaptWeatherKitHourly(data),
      daily: adaptWeatherKitDaily(data),
      minutes: adaptWeatherKitNextHour(data),
      alerts: adaptWeatherKitAlerts(data),
      raw: data,
    };
  } catch (error) {
    const data = await fetchOpenMeteoForecast(lat, lon);
    return {
      source: "open-meteo",
      current: adaptOpenMeteoCurrent(data),
      hourly: adaptOpenMeteoHourly(data),
      daily: adaptOpenMeteoDaily(data),
      minutes: adaptOpenMeteoNextHour(data),
      alerts: [],
      raw: data,
      fallbackError: error instanceof WeatherKitNotConfiguredError ? error : null,
    };
  }
}

export async function fetchAirBundle(lat, lon) {
  try {
    return await fetchOpenMeteoAir(lat, lon);
  } catch {
    return null;
  }
}
