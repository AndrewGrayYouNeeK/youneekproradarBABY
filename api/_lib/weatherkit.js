import jwt from "jsonwebtoken";

const WEATHERKIT_BASE = "https://weatherkit.apple.com/api/v1/weather";

export function isWeatherKitConfigured() {
  return Boolean(
    process.env.WEATHERKIT_TEAM_ID &&
      process.env.WEATHERKIT_KEY_ID &&
      process.env.WEATHERKIT_SERVICE_ID &&
      process.env.WEATHERKIT_PRIVATE_KEY
  );
}

function getPrivateKey() {
  return process.env.WEATHERKIT_PRIVATE_KEY.replace(/\\n/g, "\n");
}

export function createWeatherKitToken() {
  const teamId = process.env.WEATHERKIT_TEAM_ID;
  const keyId = process.env.WEATHERKIT_KEY_ID;
  const serviceId = process.env.WEATHERKIT_SERVICE_ID;

  return jwt.sign({}, getPrivateKey(), {
    algorithm: "ES256",
    expiresIn: "55m",
    issuer: teamId,
    subject: serviceId,
    header: {
      alg: "ES256",
      kid: keyId,
      id: `${teamId}.${serviceId}`,
    },
  });
}

export async function fetchWeatherKit(lat, lon, dataSets = "currentWeather,forecastHourly,forecastDaily") {
  if (!isWeatherKitConfigured()) {
    throw new Error("WeatherKit is not configured");
  }

  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new Error("Invalid coordinates");
  }

  const token = createWeatherKitToken();
  const url = new URL(`${WEATHERKIT_BASE}/en/${latitude}/${longitude}`);
  url.searchParams.set("dataSets", dataSets);
  url.searchParams.set("units", "us");
  url.searchParams.set("timezone", "auto");

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`WeatherKit ${response.status}${detail ? `: ${detail}` : ""}`);
  }

  return response.json();
}
