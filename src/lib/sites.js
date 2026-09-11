import { homePathForRole, siteRoleFromHost } from "../../functions/_lib/site.js";

export async function fetchSiteConfig() {
  const response = await fetch("/api/site", { cache: "no-store" });
  if (!response.ok) {
    return {
      role: siteRoleFromHost(window.location.hostname),
      weatherAppUrl: "",
      landingAppUrl: "",
    };
  }
  return response.json();
}

export function weatherAppOrigin(site) {
  const fromApi = String(site?.weatherAppUrl || "").replace(/\/$/, "");
  const fromEnv = String(import.meta.env.VITE_WEATHER_APP_URL || "").replace(/\/$/, "");
  return fromApi || fromEnv;
}

export function appHref(site, path) {
  const role = siteRoleFromHost(typeof window === "undefined" ? "" : window.location.hostname);
  const origin = weatherAppOrigin(site);
  if (role === "landing" && origin) return `${origin}${path}`;
  return path;
}

export { homePathForRole, siteRoleFromHost };
