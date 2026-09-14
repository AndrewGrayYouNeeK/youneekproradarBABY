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
  adaptWeatherKitAstronomy,
  adaptWeatherKitComparison,
  adaptWeatherKitCurrent,
  adaptWeatherKitDaily,
  adaptWeatherKitDayParts,
  adaptWeatherKitHourly,
  adaptWeatherKitMetadata,
  adaptWeatherKitMinuteSummary,
  adaptWeatherKitNextHour,
  splitWeatherKitHourly,
} from "@/lib/weather/weatherkit-adapters";

function isoOffset(ms) {
  return new Date(Date.now() + ms).toISOString();
}

export async function fetchForecastBundle(lat, lon) {
  try {
    const data = await fetchWeatherKit(lat, lon, undefined, {
      hourlyStart: isoOffset(-24 * 60 * 60 * 1000),
      hourlyEnd: isoOffset(10 * 24 * 60 * 60 * 1000),
    });
    const current = adaptWeatherKitCurrent(data);
    const allHours = adaptWeatherKitHourly(data);
    const { hourly, recentHours } = splitWeatherKitHourly(allHours);
    const daily = adaptWeatherKitDaily(data);
    const metadata = adaptWeatherKitMetadata(data);

    return {
      source: "weatherkit",
      current,
      hourly,
      recentHours,
      daily,
      minutes: adaptWeatherKitNextHour(data),
      minuteSummary: adaptWeatherKitMinuteSummary(data),
      dayParts: adaptWeatherKitDayParts(data),
      astronomy: adaptWeatherKitAstronomy(data),
      comparison: adaptWeatherKitComparison(allHours, current.current.temperature_2m),
      alerts: adaptWeatherKitAlerts(data),
      metadata,
      raw: data,
    };
  } catch (error) {
    const data = await fetchOpenMeteoForecast(lat, lon);
    return {
      source: "open-meteo",
      current: adaptOpenMeteoCurrent(data),
      hourly: adaptOpenMeteoHourly(data),
      recentHours: [],
      daily: adaptOpenMeteoDaily(data),
      minutes: adaptOpenMeteoNextHour(data),
      minuteSummary: [],
      dayParts: [],
      astronomy: null,
      comparison: null,
      alerts: [],
      metadata: null,
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
