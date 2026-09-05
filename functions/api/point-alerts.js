const NWS_HEADERS = {
  Accept: "application/geo+json",
  "User-Agent": "YouNeeKProRadar/1.0 (point-alerts)",
};

export async function fetchPointAlerts(lat, lon) {
  const url = `https://api.weather.gov/alerts/active?point=${lat},${lon}`;
  const response = await fetch(url, { headers: NWS_HEADERS });
  if (!response.ok) {
    throw new Error(`NWS alerts failed (${response.status})`);
  }
  const payload = await response.json();
  return (payload.features || []).map((feature) => {
    const properties = feature.properties || {};
    return {
      id: feature.id || properties.id,
      name: properties.event || properties.headline || "Weather alert",
      description: properties.headline || properties.description || "",
      source: "NWS",
      severity: properties.severity || "",
      urgency: properties.urgency || "",
      certainty: properties.certainty || "",
      issued: properties.sent || properties.effective,
      expires: properties.ends || properties.expires,
      url: properties.web,
    };
  });
}

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const alerts = await fetchPointAlerts(lat, lon);
    return Response.json(
      { alerts },
      { headers: { "Cache-Control": "public, max-age=120" } }
    );
  } catch (error) {
    return Response.json({ alerts: [], error: error.message }, { status: 502 });
  }
}
