export async function onRequestGet(context) {
  const url = new URL(context.request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  const target = new URL("https://mesonet.agron.iastate.edu/json/spcoutlook.py");
  target.searchParams.set("lat", lat);
  target.searchParams.set("lon", lon);
  target.searchParams.set("day", "1");
  target.searchParams.set("current", "1");
  target.searchParams.set("cat", "CATEGORICAL");

  try {
    const response = await fetch(target.toString(), {
      headers: {
        Accept: "application/json",
        "User-Agent": "YouNeeKProRadar/1.0",
      },
    });
    if (!response.ok) {
      return Response.json({ error: "Outlook request failed" }, { status: 502 });
    }
    const data = await response.json();
    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=300" },
    });
  } catch {
    return Response.json({ error: "Outlook proxy failed" }, { status: 502 });
  }
}
