import {
  DEFAULT_WEATHER_APP_URL,
  homePathForRole,
  resolveSiteRole,
  siteRoleFromHost,
} from "../../functions/_lib/site.js";

export async function fetchSiteConfig() {
  const response = await fetch("/api/site", { cache: "no-store" });
  if (!response.ok) {
    return {
      role: siteRoleFromHost(typeof window === "undefined" ? "" : window.location.hostname),
      weatherAppUrl: DEFAULT_WEATHER_APP_URL,
      landingAppUrl: "",
    };
  }
  return response.json();
}

export function weatherAppOrigin(site) {
  const fromApi = String(site?.weatherAppUrl || "").replace(/\/$/, "");
  const fromEnv = String(import.meta.env.VITE_WEATHER_APP_URL || "").replace(/\/$/, "");
  return fromApi || fromEnv || DEFAULT_WEATHER_APP_URL;
}

export function appHref(site, path) {
  const hostname = typeof window === "undefined" ? "" : window.location.hostname;
  const role = resolveSiteRole(site?.role, hostname);
  const origin = weatherAppOrigin(site);
  if (role === "landing" && origin) return `${origin}${path}`;
  return path;
}

export { DEFAULT_WEATHER_APP_URL, homePathForRole, resolveSiteRole, siteRoleFromHost };
