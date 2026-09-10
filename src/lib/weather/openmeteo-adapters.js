import { describeWeatherCode } from "./conditions.js";

export function adaptOpenMeteoCurrent(data) {
  const current = data?.current || {};
  const daily = data?.daily || {};
  const visMeters = current.visibility;
  return {
    current: {
      temperature_2m: current.temperature_2m,
      apparent_temperature: current.apparent_temperature,
      dew_point: current.dew_point_2m,
      relative_humidity_2m: current.relative_humidity_2m,
      wind_speed_10m: current.wind_speed_10m,
      wind_direction_10m: current.wind_direction_10m,
      wind_gusts_10m: current.wind_gusts_10m,
      weather_code: current.weather_code,
      condition_label: describeWeatherCode(current.weather_code).label,
      pressure_msl: current.pressure_msl,
      visibility: visMeters,
      visibility_mi: visMeters != null ? visMeters / 1609.344 : null,
      uv_index: current.uv_index,
      cloud_cover: current.cloud_cover,
      precipitation_intensity: current.precipitation,
      daylight: current.is_day === 1,
      as_of: current.time,
    },
    daily: {
      temperature_2m_max: daily.temperature_2m_max,
      temperature_2m_min: daily.temperature_2m_min,
      sunrise: daily.sunrise,
      sunset: daily.sunset,
    },
  };
}

export function adaptOpenMeteoHourly(data) {
  const hourly = data?.hourly || {};
  const times = hourly.time || [];
  return times.slice(0, 48).map((time, index) => ({
    time,
    temperature: Math.round(hourly.temperature_2m?.[index] ?? 0),
    pop: Math.round(hourly.precipitation_probability?.[index] ?? 0),
    label: describeWeatherCode(hourly.weather_code?.[index]).label,
    weather_code: hourly.weather_code?.[index] ?? 0,
    uv: hourly.uv_index?.[index],
    precip: hourly.precipitation?.[index],
  }));
}

export function adaptOpenMeteoDaily(data) {
  const daily = data?.daily || {};
  const dates = daily.time || [];
  return dates.slice(0, 10).map((date, index) => ({
    date,
    high: Math.round(daily.temperature_2m_max?.[index] ?? 0),
    low: Math.round(daily.temperature_2m_min?.[index] ?? 0),
    pop: Math.round(daily.precipitation_probability_max?.[index] ?? 0),
    label: describeWeatherCode(daily.weather_code?.[index]).label,
    weather_code: daily.weather_code?.[index] ?? 0,
    uv: daily.uv_index_max?.[index],
    precip: daily.precipitation_sum?.[index],
    snow: daily.snowfall_sum?.[index],
    sunrise: daily.sunrise?.[index],
    sunset: daily.sunset?.[index],
  }));
}
