import { inspectWeatherKitEnv, weatherKitSecretsHint } from "../_lib/weatherkit-key.js";

export async function onRequestGet({ env }) {
  const status = inspectWeatherKitEnv(env);
  return Response.json(
    {
      ...status,
      hint: status.configured
        ? `Worker ${status.project} has all four secrets. If forecasts still say Open-Meteo, Apple is rejecting the token or the private key cannot be parsed.`
        : weatherKitSecretsHint(env),
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
