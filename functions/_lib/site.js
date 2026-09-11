export const WEATHER_PROJECT = "youneekproradarbaby";
export const LANDING_PROJECT = "youneek-pro-radarynk222";

export function workerProjectFromEnv(env = {}) {
  return String(env.WORKER_PROJECT || env.CLOUDFLARE_WORKER_NAME || "").trim();
}

export function siteRoleFromEnv(env = {}) {
  const explicit = String(env.SITE_ROLE || "").trim().toLowerCase();
  if (explicit === "landing" || explicit === "weather" || explicit === "local") return explicit;
  const name = workerProjectFromEnv(env).toLowerCase();
  if (name.includes("ynk222") || name === LANDING_PROJECT) return "landing";
  return "weather";
}

export function siteRoleFromHost(hostname = "") {
  const host = String(hostname).toLowerCase();
  if (host.includes("youneek-pro-radarynk222") || host.includes("radarynk222")) return "landing";
  if (host.includes("youneekproradarbaby")) return "weather";
  return "local";
}

export function homePathForRole(role) {
  return role === "weather" ? "/Forecast" : "/landing";
}

export function describeSite(env = {}) {
  const role = siteRoleFromEnv(env);
  const weatherAppUrl = String(env.WEATHER_APP_URL || "").trim().replace(/\/$/, "");
  const landingAppUrl = String(env.LANDING_APP_URL || "").trim().replace(/\/$/, "");
  return {
    role,
    project: role === "landing" ? LANDING_PROJECT : WEATHER_PROJECT,
    weatherProject: WEATHER_PROJECT,
    landingProject: LANDING_PROJECT,
    weatherAppUrl,
    landingAppUrl,
  };
}
