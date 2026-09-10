import { jsonFrom } from "../_lib/fetchUpstream.js";

export async function onRequestGet() {
  try {
    const data = await jsonFrom("https://www.nhc.noaa.gov/CurrentStorms.json");
    return Response.json(data, {
      headers: { "Cache-Control": "public, max-age=180" },
    });
  } catch (err) {
    return Response.json(
      { activeStorms: [], error: err.message || "NHC request failed" },
      { status: 502 }
    );
  }
}
