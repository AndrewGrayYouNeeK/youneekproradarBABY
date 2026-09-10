import { inspectWeatherKitEnv } from "../_lib/weatherkit-key.js";

export async function onRequestGet({ env }) {
  const status = inspectWeatherKitEnv(env);
  return Response.json(
    {
      ...status,
      hint: status.configured
        ? "Worker has all four secrets. If forecasts still say Open-Meteo, Apple is rejecting the token or the private key cannot be parsed."
        : "Add these on the youneekproradarbaby Worker → Settings → Variables and Secrets (encrypted). Not the Builds tab. Names must match exactly.",
    },
    {
      headers: { "Cache-Control": "no-store" },
    }
  );
}
