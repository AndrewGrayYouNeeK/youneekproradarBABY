export async function onRequestGet() {
  const response = await fetch("https://www.nhc.noaa.gov/CurrentStorms.json", {
    headers: {
      Accept: "application/json",
      "User-Agent": "YouNeeKProRadar/1.0 (weather radar; https://github.com/AndrewGrayYouNeeK)",
    },
  });

  if (!response.ok) {
    return Response.json({ error: "NHC request failed", activeStorms: [] }, { status: 502 });
  }

  const data = await response.json();
  return Response.json(data, {
    headers: { "Cache-Control": "public, max-age=120" },
  });
}
