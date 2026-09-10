function buildParams(params) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value != null && value !== "") search.set(key, String(value));
  });
  return search.toString();
}

export async function fetchOpenMeteoForecast(lat, lon, { forecastHours = 168 } = {}) {
  const query = buildParams({
    latitude: lat,
    longitude: lon,
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,dew_point_2m,visibility",
    hourly:
      "temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,uv_index,snowfall,cape,visibility,pressure_msl,dew_point_2m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,snowfall_sum,wind_speed_10m_max,wind_gusts_10m_max",
    minutely_15: "precipitation,precipitation_probability",
    forecast_days: 10,
    forecast_hours: forecastHours,
    forecast_minutely_15: 8,
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    precipitation_unit: "inch",
    timezone: "auto",
  });

  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${query}`);
  if (!response.ok) {
    const retry = buildParams({
      latitude: lat,
      longitude: lon,
      current:
        "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index,dew_point_2m,visibility",
      hourly: "temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m,uv_index",
      daily: "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,precipitation_probability_max,snowfall_sum",
      forecast_days: 10,
      forecast_hours: forecastHours,
      temperature_unit: "fahrenheit",
      wind_speed_unit: "mph",
      precipitation_unit: "inch",
      timezone: "auto",
    });
    const fallback = await fetch(`https://api.open-meteo.com/v1/forecast?${retry}`);
    if (!fallback.ok) throw new Error("Open-Meteo forecast failed");
    return fallback.json();
  }
  return response.json();
}

export async function fetchOpenMeteoAir(lat, lon) {
  const query = buildParams({
    latitude: lat,
    longitude: lon,
    current:
      "us_aqi,pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,alder_pollen,birch_pollen,grass_pollen,mugwort_pollen,olive_pollen,ragweed_pollen,uv_index",
    hourly: "us_aqi,pm2_5,grass_pollen,ragweed_pollen,birch_pollen,alder_pollen,uv_index",
    forecast_days: 2,
    timezone: "auto",
  });

  const response = await fetch(`https://air-quality-api.open-meteo.com/v1/air-quality?${query}`);
  if (!response.ok) throw new Error("Open-Meteo air quality failed");
  return response.json();
}

export async function fetchOpenMeteoField(bounds, field, { dense = false, endpoint = "forecast" } = {}) {
  const cols = dense ? 8 : 6;
  const rows = dense ? 8 : 6;
  const west = bounds.getWest();
  const east = bounds.getEast();
  const south = bounds.getSouth();
  const north = bounds.getNorth();
  const lats = [];
  const lons = [];

  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const lat = south + ((r + 0.5) / rows) * (north - south);
      const lon = west + ((c + 0.5) / cols) * (east - west);
      lats.push(lat.toFixed(3));
      lons.push(lon.toFixed(3));
    }
  }

  const currentVars =
    field === "us_aqi"
      ? "us_aqi"
      : field === "pollen"
        ? "grass_pollen,ragweed_pollen,birch_pollen,alder_pollen"
        : field === "heat_index" || field === "wind_chill"
          ? "temperature_2m,relative_humidity_2m,wind_speed_10m"
          : field;

  const base =
    endpoint === "air-quality"
      ? "https://air-quality-api.open-meteo.com/v1/air-quality"
      : "https://api.open-meteo.com/v1/forecast";

  const query = buildParams({
    latitude: lats.join(","),
    longitude: lons.join(","),
    current: currentVars,
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "auto",
  });

  const response = await fetch(`${base}?${query}`);
  if (!response.ok) throw new Error("Open-Meteo field failed");
  const payload = await response.json();
  const rowsData = Array.isArray(payload) ? payload : [payload];

  return rowsData.map((item, index) => {
    const current = item.current || {};
    let value = current[field];
    if (field === "pollen") {
      value =
        (current.grass_pollen || 0) +
        (current.ragweed_pollen || 0) +
        (current.birch_pollen || 0) +
        (current.alder_pollen || 0);
    }
    if (field === "heat_index") {
      const t = current.temperature_2m;
      const rh = current.relative_humidity_2m;
      value =
        t < 80
          ? t
          : -42.379 +
            2.04901523 * t +
            10.14333127 * rh -
            0.22475541 * t * rh -
            0.00683783 * t * t -
            0.05481717 * rh * rh +
            0.00122874 * t * t * rh +
            0.00085282 * t * rh * rh -
            0.00000199 * t * t * rh * rh;
    }
    if (field === "wind_chill") {
      const t = current.temperature_2m;
      const w = current.wind_speed_10m;
      value =
        t > 50 || w < 3
          ? t
          : 35.74 + 0.6215 * t - 35.75 * w ** 0.16 + 0.4275 * t * w ** 0.16;
    }
    return {
      lat: Number(lats[index]),
      lon: Number(lons[index]),
      value: Number.isFinite(value) ? value : null,
    };
  });
}

export function adaptOpenMeteoCurrent(data) {
  const current = data?.current || {};
  const daily = data?.daily || {};
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
      condition_label: null,
      pressure_msl: current.pressure_msl,
      pressure_trend: "",
      visibility: current.visibility,
      visibility_mi: current.visibility != null ? current.visibility / 1609.344 : null,
      uv_index: current.uv_index,
      cloud_cover: current.cloud_cover,
      precipitation_intensity: current.precipitation,
      daylight: current.is_day === 1,
      as_of: current.time,
      cape: data?.hourly?.cape?.[0],
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
  return times.slice(0, 168).map((time, index) => ({
    time,
    temperature: Math.round(hourly.temperature_2m?.[index] ?? 0),
    pop: Math.round(hourly.precipitation_probability?.[index] ?? 0),
    label: "",
    weather_code: hourly.weather_code?.[index] ?? 0,
    uv: hourly.uv_index?.[index],
    wind: hourly.wind_speed_10m?.[index],
    gusts: hourly.wind_gusts_10m?.[index],
    precip: hourly.precipitation?.[index],
    snow: hourly.snowfall?.[index],
    humidity: hourly.relative_humidity_2m?.[index],
    cape: hourly.cape?.[index],
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
    label: "",
    weather_code: daily.weather_code?.[index] ?? 0,
    precip: daily.precipitation_sum?.[index],
    snow: daily.snowfall_sum?.[index],
    uv: daily.uv_index_max?.[index],
    sunrise: daily.sunrise?.[index],
    sunset: daily.sunset?.[index],
  }));
}

export function adaptOpenMeteoNextHour(data) {
  const minutes = data?.minutely_15 || {};
  const times = minutes.time || [];
  return times.map((time, index) => ({
    time,
    chance: Math.round(minutes.precipitation_probability?.[index] ?? 0),
    intensity: minutes.precipitation?.[index] ?? 0,
  }));
}

export function adaptAirQuality(data) {
  const current = data?.current || {};
  const pollen =
    (current.grass_pollen || 0) +
    (current.ragweed_pollen || 0) +
    (current.birch_pollen || 0) +
    (current.alder_pollen || 0) +
    (current.mugwort_pollen || 0) +
    (current.olive_pollen || 0);

  return {
    aqi: current.us_aqi,
    pm25: current.pm2_5,
    pm10: current.pm10,
    ozone: current.ozone,
    no2: current.nitrogen_dioxide,
    so2: current.sulphur_dioxide,
    co: current.carbon_monoxide,
    uv: current.uv_index,
    pollen,
    grass: current.grass_pollen,
    ragweed: current.ragweed_pollen,
    birch: current.birch_pollen,
    alder: current.alder_pollen,
    mugwort: current.mugwort_pollen,
    olive: current.olive_pollen,
    asOf: current.time,
  };
}
