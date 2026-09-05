import { describeWeatherCode } from "@/lib/weather/conditions";

function round(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : 0;
}

export async function fetchOpenMeteoForecast(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,dew_point_2m,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,visibility,precipitation,is_day"
  );
  url.searchParams.set("hourly", "temperature_2m,precipitation_probability,weather_code");
  url.searchParams.set(
    "daily",
    "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset"
  );
  url.searchParams.set("forecast_days", "10");
  url.searchParams.set("forecast_hours", "168");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("precipitation_unit", "inch");

  const response = await fetch(url.toString());
  if (!response.ok) throw new Error("Forecast unavailable");
  const payload = await response.json();
  const current = payload.current || {};
  const hourly = payload.hourly || {};
  const daily = payload.daily || {};
  const currentCode = current.weather_code;
  const currentLabel = describeWeatherCode(currentCode).label;

  return {
    current: {
      current: {
        temperature_2m: current.temperature_2m,
        apparent_temperature: current.apparent_temperature,
        dew_point: current.dew_point_2m,
        relative_humidity_2m: current.relative_humidity_2m,
        wind_speed_10m: current.wind_speed_10m,
        wind_direction_10m: current.wind_direction_10m,
        wind_gusts_10m: current.wind_gusts_10m,
        weather_code: currentCode,
        condition_label: currentLabel,
        pressure_msl: current.pressure_msl,
        visibility: current.visibility,
        visibility_mi: current.visibility != null ? current.visibility / 1609.344 : null,
        cloud_cover: current.cloud_cover,
        precipitation_intensity: current.precipitation,
        daylight: current.is_day === 1,
        as_of: current.time,
      },
      daily: {
        temperature_2m_max: daily.temperature_2m_max || [],
        temperature_2m_min: daily.temperature_2m_min || [],
        sunrise: daily.sunrise || [],
        sunset: daily.sunset || [],
      },
    },
    hourly: (hourly.time || [])
      .map((time, index) => ({
        time,
        temperature: round(hourly.temperature_2m?.[index]),
        pop: round(hourly.precipitation_probability?.[index]),
        label: describeWeatherCode(hourly.weather_code?.[index]).label,
        weather_code: hourly.weather_code?.[index] ?? 0,
      }))
      .filter((hour) => new Date(hour.time).getTime() >= Date.now() - 45 * 60 * 1000)
      .slice(0, 168),
    daily: (daily.time || []).slice(0, 10).map((date, index) => ({
      date,
      high: round(daily.temperature_2m_max?.[index]),
      low: round(daily.temperature_2m_min?.[index]),
      pop: round(daily.precipitation_probability_max?.[index]),
      label: describeWeatherCode(daily.weather_code?.[index]).label,
      weather_code: daily.weather_code?.[index] ?? 0,
    })),
    nextHour: [],
  };
}
