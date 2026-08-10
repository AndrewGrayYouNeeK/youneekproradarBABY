// Weather data fetchers — NWS + Open-Meteo on web (free, no keys).
// Apple WeatherKit is used in the native iOS app (see ios/).

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

// Forecast Discussion (AFD) — meteorologist's narrative.
// Get the WFO from the point, then fetch the latest AFD product.
export async function fetchForecastDiscussion(lat, lon) {
  const point = await fetchNWSPoint(lat, lon);
  const office = point?.properties?.cwa; // 3-letter office code (e.g., "LMK")
  if (!office) throw new Error("No WFO");
  const list = await fetch(`https://api.weather.gov/products/types/AFD/locations/${office}`, {
    headers: { Accept: "application/ld+json", "User-Agent": NWS_HEADERS["User-Agent"] },
  });
  if (!list.ok) throw new Error(`AFD list ${list.status}`);
  const listJson = await list.json();
  const latest = listJson?.["@graph"]?.[0];
  if (!latest?.["@id"]) throw new Error("No AFD products");
  const prod = await fetch(latest["@id"], {
    headers: { Accept: "application/ld+json", "User-Agent": NWS_HEADERS["User-Agent"] },
  });
  if (!prod.ok) throw new Error(`AFD ${prod.status}`);
  const j = await prod.json();
  return {
    office,
    issued: j.issuanceTime || latest.issuanceTime,
    text: j.productText || "",
  };
}

// SPC Convective Outlook — today's severe risk for the location.
// Use the SPC point query (returns categorical + probabilistic risk).
export async function fetchSPCOutlook(lat, lon) {
  // SPC public Day 1 categorical outlook GeoJSON (updates several times daily)
  const r = await fetch("https://www.spc.noaa.gov/products/outlook/day1otlk_cat.lyr.geojson");
  if (!r.ok) throw new Error(`SPC ${r.status}`);
  const j = await r.json();
  // Find the highest-risk polygon containing the point
  const tiers = ["TSTM", "MRGL", "SLGT", "ENH", "MDT", "HIGH"];
  let best = null;
  for (const f of j.features || []) {
    const label = (f.properties?.LABEL || f.properties?.DN || "").toString().toUpperCase();
    const tier = tiers.find((t) => label.includes(t));
    if (!tier) continue;
    if (pointInPolygon([lon, lat], f.geometry)) {
      const rank = tiers.indexOf(tier);
      if (!best || rank > best.rank) best = { tier, rank, label };
    }
  }
  return best || { tier: "NONE", rank: -1, label: "No Risk" };
}

function pointInPolygon(point, geometry) {
  if (!geometry) return false;
  const polys = geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  for (const poly of polys || []) {
    if (rayCast(point, poly[0])) return true;
  }
  return false;
}
function rayCast([x, y], ring) {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i], [xj, yj] = ring[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

// NWS HeatRisk — daily tier (0–4) from forecast grid.
export async function fetchHeatRisk(lat, lon) {
  const point = await fetchNWSPoint(lat, lon);
  const gridUrl = point?.properties?.forecastGridData;
  if (!gridUrl) throw new Error("No grid");
  const r = await fetch(gridUrl, { headers: NWS_HEADERS });
  if (!r.ok) throw new Error(`Grid ${r.status}`);
  const j = await r.json();
  // heatIndex max → derive simple tier (NWS HeatRisk experimental — fallback approach)
  const vals = j?.properties?.heatIndex?.values || j?.properties?.apparentTemperature?.values || [];
  const todayMax = vals.slice(0, 8).reduce((m, v) => Math.max(m, (v.value ?? -999)), -999);
  const tempF = todayMax * 9 / 5 + 32; // grid is celsius
  let tier = 0, label = "None";
  if (tempF >= 80) { tier = 1; label = "Minor"; }
  if (tempF >= 90) { tier = 2; label = "Moderate"; }
  if (tempF >= 100) { tier = 3; label = "Major"; }
  if (tempF >= 110) { tier = 4; label = "Extreme"; }
  return { tier, label, peakF: Math.round(tempF) };
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