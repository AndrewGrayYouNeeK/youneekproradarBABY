import { LANDING_PROJECT, WEATHER_PROJECT, siteRoleFromEnv, workerProjectFromEnv } from "./site.js";

function present(value) {
  return Boolean(String(value ?? "").trim());
}

export function workerProjectName(env = {}) {
  return workerProjectFromEnv(env) || WEATHER_PROJECT;
}

export function weatherKitSecretsHint(env = {}) {
  const project = workerProjectName(env);
  if (siteRoleFromEnv(env) === "landing") {
    return (
      `This is the landing page (${LANDING_PROJECT}). WeatherKit secrets belong on the weather website ` +
      `${WEATHER_PROJECT} → Settings → Variables and Secrets (not Builds). See WEATHERKIT.md`
    );
  }
  return (
    `Set WEATHERKIT_* secrets on the weather website ${project}. ` +
    `Cloudflare → Workers & Pages → ${WEATHER_PROJECT} → Settings → Variables and Secrets (not Builds). ` +
    `The landing page ${LANDING_PROJECT} does not need these secrets. See WEATHERKIT.md`
  );
}

export function trimSecret(value) {
  let next = String(value ?? "").trim();
  if (
    (next.startsWith('"') && next.endsWith('"')) ||
    (next.startsWith("'") && next.endsWith("'"))
  ) {
    next = next.slice(1, -1).trim();
  }
  return next;
}

/**
 * Cloudflare's dashboard often stores a .p8 as one line (newlines stripped).
 * jose importPKCS8 needs a real PEM with 64-char body lines.
 */
export function normalizePrivateKey(raw) {
  let key = trimSecret(raw).replace(/\\n/g, "\n").replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!key) return "";

  if (!/BEGIN [A-Z ]*PRIVATE KEY/.test(key) && /^[A-Za-z0-9+/=\s]+$/.test(key)) {
    const body = key.replace(/\s+/g, "");
    const lines = body.match(/.{1,64}/g) || [body];
    return `-----BEGIN PRIVATE KEY-----\n${lines.join("\n")}\n-----END PRIVATE KEY-----`;
  }

  const match = key.replace(/\n/g, "").match(
    /-----BEGIN ([A-Z ]*PRIVATE KEY)-----([A-Za-z0-9+/=]+)-----END \1-----/
  );
  if (match) {
    const type = match[1];
    const body = match[2];
    const lines = body.match(/.{1,64}/g) || [body];
    return `-----BEGIN ${type}-----\n${lines.join("\n")}\n-----END ${type}-----`;
  }

  return key;
}

export function privateKeyLooksLikePem(raw) {
  const key = normalizePrivateKey(raw);
  return (
    key.includes("BEGIN") &&
    key.includes("PRIVATE KEY") &&
    key.includes("END") &&
    key.replace(/\s+/g, "").length > 80
  );
}

export function inspectWeatherKitEnv(env = {}) {
  const teamId = present(env.WEATHERKIT_TEAM_ID);
  const keyId = present(env.WEATHERKIT_KEY_ID);
  const serviceId = present(env.WEATHERKIT_SERVICE_ID);
  const privateKey = present(env.WEATHERKIT_PRIVATE_KEY);
  return {
    configured: teamId && keyId && serviceId && privateKey,
    project: workerProjectName(env),
    secrets: {
      WEATHERKIT_TEAM_ID: teamId,
      WEATHERKIT_KEY_ID: keyId,
      WEATHERKIT_SERVICE_ID: serviceId,
      WEATHERKIT_PRIVATE_KEY: privateKey,
    },
    privateKeyLooksLikePem: privateKeyLooksLikePem(env.WEATHERKIT_PRIVATE_KEY),
    missing: [
      !teamId && "WEATHERKIT_TEAM_ID",
      !keyId && "WEATHERKIT_KEY_ID",
      !serviceId && "WEATHERKIT_SERVICE_ID",
      !privateKey && "WEATHERKIT_PRIVATE_KEY",
    ].filter(Boolean),
  };
}

export function isWeatherKitConfigured(env) {
  return inspectWeatherKitEnv(env).configured;
}
