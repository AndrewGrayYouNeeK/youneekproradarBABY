import assert from "node:assert/strict";
import test from "node:test";
import {
  LANDING_PROJECT,
  WEATHER_PROJECT,
  describeSite,
  homePathForRole,
  siteRoleFromEnv,
  siteRoleFromHost,
} from "./site.js";

test("hostnames map to landing vs weather vs local", () => {
  assert.equal(siteRoleFromHost("youneek-pro-radarynk222.pages.dev"), "landing");
  assert.equal(siteRoleFromHost("youneekproradarbaby.andrew.workers.dev"), "weather");
  assert.equal(siteRoleFromHost("127.0.0.1"), "local");
});

test("weather site home is NOW, landing and local home is the splash page", () => {
  assert.equal(homePathForRole("weather"), "/Forecast");
  assert.equal(homePathForRole("landing"), "/landing");
  assert.equal(homePathForRole("local"), "/landing");
});

test("wrangler SITE_ROLE and worker name pick the Cloudflare project", () => {
  assert.equal(siteRoleFromEnv({ SITE_ROLE: "landing" }), "landing");
  assert.equal(siteRoleFromEnv({ CLOUDFLARE_WORKER_NAME: WEATHER_PROJECT }), "weather");
  const landing = describeSite({ SITE_ROLE: "landing", WEATHER_APP_URL: "https://weather.example" });
  assert.equal(landing.project, LANDING_PROJECT);
  assert.equal(landing.weatherAppUrl, "https://weather.example");
  const weather = describeSite({ SITE_ROLE: "weather" });
  assert.equal(weather.project, WEATHER_PROJECT);
});
