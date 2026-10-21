import {
  normalizeAlert,
  outlineFeatures,
  parseGeocodeResults,
  sortAlerts,
  zonesForOutlines,
} from "@/lib/landing/briefing";

const NWS_HEADERS = { Accept: "application/geo+json" };

export async function fetchActiveAlerts(lat, lon) {
  const response = await fetch(`https://api.weather.gov/alerts/active?point=${lat},${lon}`, {
    headers: NWS_HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error("NWS alerts unavailable");
  const payload = await response.json();
  return sortAlerts((payload.features || []).map(normalizeAlert));
}

export async function fetchNwsPlace(lat, lon) {
  const response = await fetch(`https://api.weather.gov/points/${Number(lat).toFixed(4)},${Number(lon).toFixed(4)}`, {
    headers: NWS_HEADERS,
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) return { label: "", zones: [] };
  const payload = await response.json();
  const properties = payload?.properties || {};
  const place = properties.relativeLocation?.properties || {};
  return {
    label: [place.city, place.state].filter(Boolean).join(", "),
    zones: [properties.county, properties.forecastZone].filter(
      (url) => typeof url === "string" && url.startsWith("https://api.weather.gov/zones/")
    ),
  };
}

export async function fetchZoneGeometry(url) {
  if (typeof url !== "string" || !url.startsWith("https://api.weather.gov/zones/")) return null;
  try {
    const response = await fetch(url, { headers: NWS_HEADERS, signal: AbortSignal.timeout(8000) });
    if (!response.ok) return null;
    const payload = await response.json();
    return payload?.geometry?.type ? payload.geometry : null;
  } catch {
    return null;
  }
}

export async function fetchAlertOutlines(alerts, pointZones) {
  const urls = zonesForOutlines(alerts, pointZones);
  const pairs = await Promise.all(urls.map(async (url) => [url, await fetchZoneGeometry(url)]));
  const geometriesByUrl = {};
  pairs.forEach(([url, geometry]) => {
    if (geometry) geometriesByUrl[url] = geometry;
  });
  return outlineFeatures(alerts, geometriesByUrl);
}

export async function searchPlaces(query) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "5");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error("City search unavailable");
  return parseGeocodeResults(await response.json());
}
