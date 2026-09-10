import { jsonFrom } from "../_lib/fetchUpstream.js";

function isoMinutesAgo(minutes) {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
}

export async function onRequestGet() {
  const sts = isoMinutesAgo(120);
  const ets = isoMinutesAgo(0);
  const candidates = [
    `https://mesonet.agron.iastate.edu/geojson/lsr.py?sts=${encodeURIComponent(sts)}&ets=${encodeURIComponent(ets)}&type=L`,
    `https://mesonet.agron.iastate.edu/geojson/lsr.py?hours=2`,
    "https://api.weather.gov/alerts/active?event=Severe%20Thunderstorm%20Warning",
  ];

  for (const url of candidates) {
    try {
      const data = await jsonFrom(url);
      const features = (data?.features || [])
        .filter((feature) => isLightningLike(feature))
        .slice(0, 400)
        .map(toStrikeFeature);
      return Response.json(
        { type: "FeatureCollection", features, generated: Date.now() },
        { headers: { "Cache-Control": "public, max-age=60" } }
      );
    } catch {
      // try next source
    }
  }

  return Response.json({ type: "FeatureCollection", features: [], generated: Date.now() });
}

function isLightningLike(feature) {
  const props = feature?.properties || {};
  const type = String(props.typetext || props.type || props.event || props.phenom || "").toLowerCase();
  return (
    type.includes("lightning") ||
    type === "l" ||
    type.includes("thunderstorm") ||
    type.includes("tstm")
  );
}

function toStrikeFeature(feature) {
  const props = feature.properties || {};
  return {
    type: "Feature",
    geometry: feature.geometry,
    properties: {
      mag: props.magnitude || props.mag || null,
      city: props.city || props.areaDesc || "",
      source: props.source || props.wfo || "NWS",
      remark: props.remark || props.headline || props.event || "Lightning",
      valid: props.valid || props.effective || props.updated,
    },
  };
}
