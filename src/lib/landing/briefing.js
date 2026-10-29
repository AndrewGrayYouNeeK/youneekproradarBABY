const SEVERITY_RANK = {
  Extreme: 0,
  Severe: 1,
  Moderate: 2,
  Minor: 3,
  Unknown: 4,
};

const CARDINALS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

export function cardinal(deg) {
  if (!Number.isFinite(Number(deg))) return "";
  return CARDINALS[Math.round(Number(deg) / 22.5) % 16];
}

export function formatWind(current) {
  if (!current) return "—";
  const speed = Number(current.wind_speed_10m);
  const gust = Number(current.wind_gusts_10m);
  if (!Number.isFinite(speed)) return "—";
  const dir = cardinal(current.wind_direction_10m);
  const base = `${dir} ${Math.round(speed)} mph`.trim();
  if (Number.isFinite(gust) && Math.round(gust) > Math.round(speed)) {
    return `${base}, gusts ${Math.round(gust)} mph`;
  }
  return base;
}

export function upcomingHours(hourly, count = 6, now = Date.now()) {
  return (hourly || [])
    .filter((hour) => new Date(hour.time).getTime() >= now - 30 * 60 * 1000)
    .slice(0, count);
}

export function upcomingDays(daily, count = 5) {
  return (daily || []).slice(0, count);
}

export function parseGeocodeResults(payload) {
  return (payload?.results || [])
    .slice(0, 5)
    .map((result) => ({
      id: result.id,
      label: [result.name, result.admin1, result.country_code].filter(Boolean).join(", "),
      latitude: Number(result.latitude),
      longitude: Number(result.longitude),
    }))
    .filter((result) => Number.isFinite(result.latitude) && Number.isFinite(result.longitude));
}

function clipText(text, max = 220) {
  const clean = String(text || "").replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const space = cut.lastIndexOf(" ");
  const trimmed = (space > 80 ? cut.slice(0, space) : cut).trim();
  return `${trimmed}…`;
}

export function shortInstruction(properties) {
  const instruction = clipText(properties?.instruction);
  if (instruction) return instruction;
  return clipText(properties?.description);
}

export function normalizeAlert(feature) {
  const properties = feature?.properties || {};
  const affectedZones = (properties.affectedZones || [])
    .filter((url) => typeof url === "string" && url.startsWith("https://api.weather.gov/zones/"))
    .slice(0, 40);
  return {
    id: feature?.id || properties.id || properties.headline || properties.event,
    event: properties.event || "Weather alert",
    headline: properties.headline || properties.event || "Weather alert",
    severity: properties.severity || "Unknown",
    expires: properties.ends || properties.expires || null,
    instruction: shortInstruction(properties),
    url: properties.web || "https://www.weather.gov",
    geometry: feature?.geometry?.type ? feature.geometry : null,
    affectedZones,
  };
}

export function zonesForOutlines(alerts, pointZones) {
  const local = new Set(pointZones || []);
  if (!local.size) return [];
  const urls = [];
  for (const alert of alerts || []) {
    if (alert.geometry?.type) continue;
    for (const url of alert.affectedZones || []) {
      if (local.has(url)) urls.push(url);
    }
  }
  return [...new Set(urls)].slice(0, 4);
}

export function outlineFeatures(alerts, geometriesByUrl = {}) {
  const features = [];
  for (const alert of alerts || []) {
    if (alert.geometry?.type) {
      features.push(alert);
      continue;
    }
    for (const url of alert.affectedZones || []) {
      const geometry = geometriesByUrl[url];
      if (!geometry?.type) continue;
      features.push({ ...alert, id: `${alert.id}:${url}`, geometry });
    }
  }
  return features;
}

export function sortAlerts(alerts) {
  return [...(alerts || [])].sort(
    (a, b) => (SEVERITY_RANK[a.severity] ?? 5) - (SEVERITY_RANK[b.severity] ?? 5)
  );
}

export function outlineStyle(severity) {
  const color = severity === "Extreme" ? "#ff0033" : severity === "Severe" ? "#ff7a18" : severity === "Moderate" ? "#ffd400" : "#7dd3fc";
  return {
    color,
    weight: 3,
    fillColor: color,
    fillOpacity: 0.22,
    dashArray: "4,3",
  };
}

export function radarFrameStamps(now = new Date(), count = 5) {
  const end = new Date(now.getTime());
  end.setUTCSeconds(0, 0);
  end.setUTCMinutes(end.getUTCMinutes() - (end.getUTCMinutes() % 5) - 10);
  const stamps = [];
  for (let i = count - 1; i >= 0; i -= 1) {
    const frame = new Date(end.getTime() - i * 5 * 60 * 1000);
    const pad = (value) => String(value).padStart(2, "0");
    stamps.push({
      stamp:
        String(frame.getUTCFullYear()) +
        pad(frame.getUTCMonth() + 1) +
        pad(frame.getUTCDate()) +
        pad(frame.getUTCHours()) +
        pad(frame.getUTCMinutes()),
      time: frame.toISOString(),
    });
  }
  return stamps;
}

export function formatAlertExpires(iso) {
  const date = new Date(iso || "");
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString([], { weekday: "short", hour: "numeric", minute: "2-digit" });
}
