import { fetchWeatherKit, inspectWeatherKitEnv, isWeatherKitConfigured } from "../_lib/weatherkit.js";

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!isWeatherKitConfigured(env)) {
    return Response.json(
      {
        error: "WeatherKit is not configured",
        hint: "Set WEATHERKIT_* secrets on the youneekproradarbaby Worker → Settings → Variables and Secrets (not Builds). See WEATHERKIT.md",
        ...inspectWeatherKitEnv(env),
      },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const lat = url.searchParams.get("lat");
  const lon = url.searchParams.get("lon");
  const dataSets = url.searchParams.get("dataSets");

  if (!lat || !lon) {
    return Response.json({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const timezone = url.searchParams.get("timezone");
    const data = await fetchWeatherKit(env, lat, lon, dataSets || undefined, timezone || undefined);
    return Response.json(data, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    return Response.json(
      {
        error: err.message || "WeatherKit request failed",
        code: /private key/i.test(err.message || "") ? "invalid_private_key" : "weatherkit_request_failed",
      },
      { status: 502 }
    );
  }
}
