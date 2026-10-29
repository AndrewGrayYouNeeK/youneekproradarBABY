import { skyTheme } from "../weather/skyTheme.js";

export function parseIpLocation(payload) {
  const latitude = Number(payload?.latitude);
  const longitude = Number(payload?.longitude);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return null;
  const city = String(payload.city || "").trim();
  const region = String(payload.region || payload.region_code || "").trim();
  const label = [city, region].filter(Boolean).join(", ");
  return { latitude, longitude, label, source: "ip" };
}

export function currentIsUsable(current) {
  return Boolean(current) && Number.isFinite(Number(current.temperature_2m));
}

/** Prefer the radar app's weather when it returns, otherwise the free forecast. */
export function pickVisitorConditions(ynkCurrent, meteoCurrent) {
  if (currentIsUsable(ynkCurrent)) return { source: "ynk222", current: ynkCurrent };
  if (currentIsUsable(meteoCurrent)) return { source: "open-meteo", current: meteoCurrent };
  return null;
}

export function daylightFromCurrent(current) {
  if (!current) return true;
  if (current.daylight != null) return current.daylight !== false;
  if (current.is_day != null) return Number(current.is_day) !== 0;
  return true;
}

export function fallbackSky(date = new Date()) {
  const hour = date.getHours();
  const daylight = hour >= 6 && hour < 20;
  return skyTheme({
    weatherCode: daylight ? 1 : 0,
    conditionCode: daylight ? "MostlyClear" : "Clear",
    daylight,
  });
}

export function skyFromCurrent(current, date = new Date()) {
  if (!currentIsUsable(current)) return fallbackSky(date);
  return skyTheme({
    weatherCode: current.weather_code,
    conditionCode: current.condition_code || "",
    daylight: daylightFromCurrent(current),
    precipitationIntensity: current.precipitation_intensity,
  });
}
