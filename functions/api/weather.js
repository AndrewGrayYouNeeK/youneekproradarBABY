import { fetchWeatherKit, inspectWeatherKitEnv, isWeatherKitConfigured } from "../_lib/weatherkit.js";
import { weatherKitSecretsHint } from "../_lib/weatherkit-key.js";
import { jsonWithCors } from "../_lib/cors.js";

export async function onRequestGet(context) {
  const { env, request } = context;

  if (!isWeatherKitConfigured(env)) {
    return jsonWithCors(
      {
        error: "WeatherKit is not configured",
        hint: weatherKitSecretsHint(env),
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
    return jsonWithCors({ error: "lat and lon are required" }, { status: 400 });
  }

  try {
    const timezone = url.searchParams.get("timezone");
    const data = await fetchWeatherKit(env, lat, lon, dataSets || undefined, timezone || undefined);
    return jsonWithCors(data, {
      headers: {
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (err) {
    return jsonWithCors(
      {
        error: err.message || "WeatherKit request failed",
        code: /private key/i.test(err.message || "") ? "invalid_private_key" : "weatherkit_request_failed",
      },
      { status: 502 }
    );
  }
}
