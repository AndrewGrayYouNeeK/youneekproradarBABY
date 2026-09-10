import { jsonFrom } from "../_lib/fetchUpstream.js";

const CANDIDATES = [
  "https://mesonet.agron.iastate.edu/json/spc_outlook.py?day=1&cat=categorical",
  "https://mapservices.weather.noaa.gov/vector/rest/services/outlooks/SPC_wx_outlks/MapServer/1/query?where=1%3D1&outFields=*&f=geojson",
  "https://www.spc.noaa.gov/products/outlook/day1otlk_cat.nolyr.geojson",
];

export async function onRequestGet() {
  const errors = [];

  for (const url of CANDIDATES) {
    try {
      const data = await jsonFrom(url);
      return Response.json(normalizeOutlook(data), {
        headers: { "Cache-Control": "public, max-age=300" },
      });
    } catch (err) {
      errors.push(`${url}: ${err.message}`);
    }
  }

  return Response.json(
    { type: "FeatureCollection", features: [], error: errors.join(" | ") },
    { status: 502 }
  );
}

function normalizeOutlook(data) {
  if (data?.type === "FeatureCollection") return data;
  if (Array.isArray(data?.outlooks)) {
    return {
      type: "FeatureCollection",
      features: data.outlooks.flatMap((outlook) => outlook.features || []),
    };
  }
  return { type: "FeatureCollection", features: [] };
}
