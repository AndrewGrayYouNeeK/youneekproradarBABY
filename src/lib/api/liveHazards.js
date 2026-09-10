import { haversineKm } from "@/lib/geo";
import { classifyStorm } from "@/lib/weather/lifestyle";

export async function fetchHurricanes() {
  const response = await fetch("/api/storms");
  if (!response.ok) throw new Error("Hurricane data unavailable");
  const payload = await response.json();
  return (payload.activeStorms || []).map((storm) => {
    const windKt = Number(storm.intensity);
    return {
      id: storm.id,
      name: storm.name,
      classification: storm.classification,
      label: classifyStorm(storm.classification, windKt),
      windKt,
      pressureMb: Number(storm.pressure),
      lat: storm.latitudeNumeric,
      lng: storm.longitudeNumeric,
      movementDir: storm.movementDir,
      movementSpeed: storm.movementSpeed,
      lastUpdate: storm.lastUpdate,
      advisoryUrl: storm.publicAdvisory?.url,
      discussionUrl: storm.forecastDiscussion?.url,
      graphicsUrl: storm.forecastGraphics?.url,
    };
  });
}

export async function fetchWildfires() {
  const response = await fetch(
    "https://eonet.gsfc.nasa.gov/api/v3/events?category=wildfires&status=open&limit=60"
  );
  if (!response.ok) throw new Error("Wildfire data unavailable");
  const payload = await response.json();
  return (payload.events || []).map((event) => {
    const geometry = [...(event.geometry || [])].reverse().find((item) => item.coordinates?.length >= 2);
    const [lng, lat] = geometry?.coordinates || [];
    return {
      id: event.id,
      title: event.title,
      lat,
      lng,
      date: geometry?.date,
      sources: event.sources,
    };
  }).filter((fire) => Number.isFinite(fire.lat) && Number.isFinite(fire.lng));
}

export async function fetchLightningReports() {
  const urls = [
    "https://mesonet.agron.iastate.edu/geojson/lsr.py?hours=2",
    "https://mesonet.agron.iastate.edu/geojson/lsr.php?hours=2",
  ];

  let data = null;
  for (const url of urls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;
      data = await response.json();
      break;
    } catch {
      // try next source
    }
  }

  const features = data?.features || [];
  return features
    .filter((feature) => {
      const text = `${feature.properties?.typetext || ""} ${feature.properties?.type || ""}`;
      return /lightning|lgt/i.test(text);
    })
    .map((feature) => {
      const [lng, lat] = feature.geometry?.coordinates || [];
      return {
        id: feature.id || `${lat},${lng},${feature.properties?.valid}`,
        lat,
        lng,
        city: feature.properties?.city || feature.properties?.county,
        source: feature.properties?.source,
        valid: feature.properties?.valid || feature.properties?.wfo,
        remark: feature.properties?.remark,
      };
    })
    .filter((strike) => Number.isFinite(strike.lat) && Number.isFinite(strike.lng));
}

export function closestReport(reports, lat, lon) {
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || !reports?.length) return null;
  return reports.reduce((closest, report) => {
    const km = haversineKm(lat, lon, report.lat, report.lng);
    if (!closest || km < closest.km) return { ...report, km };
    return closest;
  }, null);
}

export async function fetchSevereOutlook(lat, lon) {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  const response = await fetch(`/api/outlook?${params.toString()}`);
  if (!response.ok) throw new Error("Outlook request failed");
  return response.json();
}

export async function fetchNwsPointAlerts(lat, lon) {
  const response = await fetch(
    `https://api.weather.gov/alerts/active?point=${lat},${lon}`,
    { headers: { Accept: "application/geo+json" } }
  );
  if (!response.ok) throw new Error("NWS alerts unavailable");
  const data = await response.json();
  return (data.features || []).map((feature) => ({
    id: feature.id,
    event: feature.properties?.event,
    headline: feature.properties?.headline,
    severity: feature.properties?.severity,
    urgency: feature.properties?.urgency,
    description: feature.properties?.description,
    instruction: feature.properties?.instruction,
    ends: feature.properties?.ends,
    sender: feature.properties?.senderName,
  }));
}

export async function searchPlaces(query) {
  const params = new URLSearchParams({ q: query });
  const response = await fetch(`/api/geocode?${params.toString()}`);
  if (!response.ok) throw new Error("Location search failed");
  return response.json();
}

export async function reverseGeocode(lat, lon) {
  const params = new URLSearchParams({ lat: String(lat), lon: String(lon) });
  const response = await fetch(`/api/geocode?${params.toString()}`);
  if (!response.ok) return null;
  return response.json();
}
