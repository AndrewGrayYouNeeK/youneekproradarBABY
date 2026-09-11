import assert from "node:assert/strict";
import test from "node:test";
import {
  inspectWeatherKitEnv,
  normalizePrivateKey,
  privateKeyLooksLikePem,
  weatherKitSecretsHint,
} from "./weatherkit-key.js";
import { WEATHER_PROJECT, LANDING_PROJECT } from "./site.js";

const BODY =
  "MIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgAAAAAAAAAAAAAAAAAAAAAAAHBgkqhkiG9w0BAQEFAASBjzCBjAIBAT";

test("rebuilds a one-line Cloudflare-pasted PEM", () => {
  const smashed = `-----BEGIN PRIVATE KEY-----${BODY}-----END PRIVATE KEY-----`;
  const pem = normalizePrivateKey(smashed);
  assert.match(pem, /^-----BEGIN PRIVATE KEY-----\n/);
  assert.match(pem, /\n-----END PRIVATE KEY-----$/);
  assert.ok(pem.includes("\n"));
  assert.equal(privateKeyLooksLikePem(smashed), true);
});

test("accepts literal \\n from wrangler secret put", () => {
  const pem = normalizePrivateKey(
    `-----BEGIN PRIVATE KEY-----\\n${BODY}\\n-----END PRIVATE KEY-----`
  );
  assert.ok(pem.split("\n").length >= 3);
});

test("strips wrapping quotes and whitespace", () => {
  const pem = normalizePrivateKey(`  "-----BEGIN PRIVATE KEY-----${BODY}-----END PRIVATE KEY-----"  `);
  assert.ok(pem.startsWith("-----BEGIN PRIVATE KEY-----"));
});

test("inspect reports which of the four secrets the Worker actually has", () => {
  const status = inspectWeatherKitEnv({
    WEATHERKIT_TEAM_ID: "ABCD123456",
    WEATHERKIT_KEY_ID: "  ",
    WEATHERKIT_SERVICE_ID: "com.youneek.proradar.weather",
  });
  assert.equal(status.configured, false);
  assert.deepEqual(status.missing, ["WEATHERKIT_KEY_ID", "WEATHERKIT_PRIVATE_KEY"]);
  assert.equal(status.secrets.WEATHERKIT_TEAM_ID, true);
  assert.equal(status.secrets.WEATHERKIT_KEY_ID, false);
  assert.equal(status.project, WEATHER_PROJECT);
});

test("inspect uses CLOUDFLARE_WORKER_NAME from the live Worker", () => {
  const status = inspectWeatherKitEnv({ CLOUDFLARE_WORKER_NAME: "youneekproradarbaby" });
  assert.equal(status.project, "youneekproradarbaby");
});

test("hints point WeatherKit secrets at the weather website, not the landing page", () => {
  const weather = weatherKitSecretsHint({ CLOUDFLARE_WORKER_NAME: WEATHER_PROJECT, SITE_ROLE: "weather" });
  assert.match(weather, /youneekproradarbaby/);
  assert.match(weather, /landing page/);
  const landing = weatherKitSecretsHint({ SITE_ROLE: "landing" });
  assert.match(landing, /landing page/);
  assert.match(landing, /youneekproradarbaby/);
  assert.match(landing, new RegExp(LANDING_PROJECT));
});
