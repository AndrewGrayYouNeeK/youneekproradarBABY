const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = "YouNeeKProRadar/1.0 (weather radar; https://github.com/AndrewGrayYouNeeK)";

export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const query = url.searchParams.get("q");
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  const headers = {
    Accept: "application/json",
    "User-Agent": UA,
  };

  try {
    if (query) {
      const target = new URL(`${NOMINATIM}/search`);
      target.searchParams.set("q", query);
      target.searchParams.set("format", "json");
      target.searchParams.set("addressdetails", "1");
      target.searchParams.set("limit", "6");
      const response = await fetch(target, { headers });
      const results = await response.json();
      return Response.json(
        (results || []).map((item) => ({
          id: String(item.place_id),
          name: item.display_name?.split(",").slice(0, 3).join(", "),
          latitude: Number(item.lat),
          longitude: Number(item.lon),
        })),
        { headers: { "Cache-Control": "public, max-age=300" } }
      );
    }

    if (lat && lon) {
      const target = new URL(`${NOMINATIM}/reverse`);
      target.searchParams.set("lat", lat);
      target.searchParams.set("lon", lon);
      target.searchParams.set("format", "json");
      const response = await fetch(target, { headers });
      const item = await response.json();
      return Response.json({
        id: String(item.place_id || `${lat},${lon}`),
        name: item.address?.city || item.address?.town || item.address?.village || item.display_name?.split(",")[0] || "Selected location",
        fullName: item.display_name,
        latitude: Number(lat),
        longitude: Number(lon),
      });
    }

    return Response.json({ error: "q or lat/lon required" }, { status: 400 });
  } catch {
    return Response.json({ error: "Geocode failed" }, { status: 502 });
  }
}
