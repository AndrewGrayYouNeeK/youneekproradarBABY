// Lightweight weather/NWS data fetchers — all client-side, no keys needed.

const NWS_HEADERS = { Accept: "application/geo+json", "User-Agent": "YouNeeKRadar/1.0 (weather)" };

export async function fetchNWSPoint(lat, lon) {
  const r = await fetch(`https://api.weather.gov/points/${lat.toFixed(4)},${lon.toFixed(4)}`, { headers: NWS_HEADERS });
  if (!r.ok) throw new Error(`NWS point ${r.status}`);
  return r.json();
}

export async function fetchHourlyForecast(lat, lon) {
  const point = await fetchNWSPoint(lat, lon);
  const url = point?.properties?.forecastHourly;
  if (!url) throw new Error("No forecastHourly URL");
  const r = await fetch(url, { headers: NWS_HEADERS });
  if (!r.ok) throw new Error(`Hourly ${r.status}`);
  return r.json();
}

export async function fetchDailyForecast(lat, lon) {
  const point = await fetchNWSPoint(lat, lon);
  const url = point?.properties?.forecast;
  if (!url) throw new Error("No forecast URL");
  const r = await fetch(url, { headers: NWS_HEADERS });
  if (!r.ok) throw new Error(`Forecast ${r.status}`);
  return r.json();
}

export async function fetchActiveAlerts(lat, lon) {
  const r = await fetch(
    `https://api.weather.gov/alerts/active?point=${lat.toFixed(4)},${lon.toFixed(4)}`,
    { headers: NWS_HEADERS }
  );
  if (!r.ok) throw new Error(`Alerts ${r.status}`);
  return r.json();
}

// Open-Meteo for current conditions, AQI, UV — no API key needed.
export async function fetchCurrentConditions(lat, lon) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set(
    "current",
    "temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,rain,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,pressure_msl,cloud_cover,uv_index,visibility,is_day"
  );
  url.searchParams.set("daily", "sunrise,sunset,uv_index_max,precipitation_probability_max,temperature_2m_max,temperature_2m_min");
  url.searchParams.set("temperature_unit", "fahrenheit");
  url.searchParams.set("wind_speed_unit", "mph");
  url.searchParams.set("precipitation_unit", "inch");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`OM ${r.status}`);
  return r.json();
}

export async function fetchAirQuality(lat, lon) {
  const url = new URL("https://air-quality-api.open-meteo.com/v1/air-quality");
  url.searchParams.set("latitude", lat);
  url.searchParams.set("longitude", lon);
  url.searchParams.set("current", "us_aqi,pm10,pm2_5,ozone,carbon_monoxide,nitrogen_dioxide");
  url.searchParams.set("timezone", "auto");
  const r = await fetch(url.toString());
  if (!r.ok) throw new Error(`AQ ${r.status}`);
  return r.json();
}

// Severity mapping for NWS alerts → color / priority
export function alertSeverity(event = "") {
  const e = event.toLowerCase();
  if (e.includes("tornado warning") || e.includes("flash flood emergency") || e.includes("hurricane warning"))
    return { tier: "extreme", color: "red", priority: 5 };
  if (e.includes("severe thunderstorm warning") || e.includes("flash flood warning") || e.includes("tornado watch"))
    return { tier: "severe", color: "orange", priority: 4 };
  if (e.includes("warning")) return { tier: "warning", color: "yellow", priority: 3 };
  if (e.includes("watch")) return { tier: "watch", color: "amber", priority: 2 };
  if (e.includes("advisory") || e.includes("statement")) return { tier: "advisory", color: "cyan", priority: 1 };
  return { tier: "info", color: "slate", priority: 0 };
}

// Weather code → label / icon
export const WMO_CODES = {
  0: { label: "Clear", icon: "Sun" },
  1: { label: "Mostly Clear", icon: "Sun" },
  2: { label: "Partly Cloudy", icon: "CloudSun" },
  3: { label: "Overcast", icon: "Cloud" },
  45: { label: "Fog", icon: "CloudFog" },
  48: { label: "Rime Fog", icon: "CloudFog" },
  51: { label: "Light Drizzle", icon: "CloudDrizzle" },
  53: { label: "Drizzle", icon: "CloudDrizzle" },
  55: { label: "Heavy Drizzle", icon: "CloudDrizzle" },
  61: { label: "Light Rain", icon: "CloudRain" },
  63: { label: "Rain", icon: "CloudRain" },
  65: { label: "Heavy Rain", icon: "CloudRainWind" },
  71: { label: "Light Snow", icon: "CloudSnow" },
  73: { label: "Snow", icon: "CloudSnow" },
  75: { label: "Heavy Snow", icon: "CloudSnow" },
  77: { label: "Snow Grains", icon: "CloudSnow" },
  80: { label: "Showers", icon: "CloudRain" },
  81: { label: "Heavy Showers", icon: "CloudRainWind" },
  82: { label: "Violent Showers", icon: "CloudRainWind" },
  85: { label: "Snow Showers", icon: "CloudSnow" },
  86: { label: "Heavy Snow Showers", icon: "CloudSnow" },
  95: { label: "Thunderstorm", icon: "CloudLightning" },
  96: { label: "Thunderstorm w/ Hail", icon: "CloudLightning" },
  99: { label: "Severe Thunderstorm", icon: "CloudLightning" },
};

export function describeWeatherCode(code) {
  return WMO_CODES[code] || { label: "Unknown", icon: "Cloud" };
}

export function degToCardinal(deg) {
  if (!Number.isFinite(deg)) return "—";
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}