import { SignJWT, importPKCS8 } from "jose";
import { inspectWeatherKitEnv, isWeatherKitConfigured, normalizePrivateKey, trimSecret } from "./weatherkit-key.js";

const WEATHERKIT_BASE = "https://weatherkit.apple.com/api/v1/weather";
const DEFAULT_DATASETS =
  "currentWeather,forecastHourly,forecastDaily,forecastNextHour,weatherAlerts";

export { inspectWeatherKitEnv, isWeatherKitConfigured };

export async function createWeatherKitToken(env) {
  const teamId = trimSecret(env.WEATHERKIT_TEAM_ID);
  const keyId = trimSecret(env.WEATHERKIT_KEY_ID);
  const serviceId = trimSecret(env.WEATHERKIT_SERVICE_ID);
  const pem = normalizePrivateKey(env.WEATHERKIT_PRIVATE_KEY);

  let privateKey;
  try {
    privateKey = await importPKCS8(pem, "ES256");
  } catch {
    throw new Error(
      "WeatherKit private key could not be read. Paste the full .p8, including BEGIN/END lines. In the Cloudflare dashboard, use one line with \\n for each line break."
    );
  }

  return new SignJWT({})
    .setProtectedHeader({
      alg: "ES256",
      kid: keyId,
      id: `${teamId}.${serviceId}`,
    })
    .setIssuer(teamId)
    .setSubject(serviceId)
    .setIssuedAt()
    .setExpirationTime("55m")
    .sign(privateKey);
}

export async function fetchWeatherKit(env, lat, lon, dataSets = DEFAULT_DATASETS, timezone) {
  if (!isWeatherKitConfigured(env)) {
    throw new Error("WeatherKit is not configured");
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates");
  }

  const token = await createWeatherKitToken(env);
  const url = new URL(`${WEATHERKIT_BASE}/en_US/${latitude}/${longitude}`);
  url.searchParams.set("dataSets", dataSets);
  url.searchParams.set("country", "US");
  // Do not send units=us — Apple rejects invalid unit values and the app then
  // looks like WeatherKit "isn't working" even when all four secrets are set.
  if (timezone && timezone !== "auto") {
    url.searchParams.set("timezone", timezone);
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    let reason = "";
    try {
      reason = JSON.parse(detail)?.reason || "";
    } catch {
      reason = detail.slice(0, 180);
    }
    if (response.status === 401) {
      throw new Error(
        `Apple rejected the WeatherKit token (401${reason ? `: ${reason}` : ""}). Check Team ID, Key ID, Services ID, and that WeatherKit is enabled on both the key and the Services ID.`
      );
    }
    throw new Error(`WeatherKit ${response.status}${reason ? `: ${reason}` : ""}`);
  }

  return response.json();
}
