import assert from "node:assert/strict";
import test from "node:test";
import {
  inspectWeatherKitEnv,
  normalizePrivateKey,
  privateKeyLooksLikePem,
  weatherKitSecretsHint,
  WEBSITE_PROJECT,
} from "./weatherkit-key.js";

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
  assert.equal(status.project, WEBSITE_PROJECT);
});

test("inspect uses CLOUDFLARE_WORKER_NAME from the live Worker", () => {
  const status = inspectWeatherKitEnv({ CLOUDFLARE_WORKER_NAME: "youneek-pro-radarynk222" });
  assert.equal(status.project, "youneek-pro-radarynk222");
});

test("hints point WeatherKit secrets at the live YNK222 website", () => {
  const website = weatherKitSecretsHint({ CLOUDFLARE_WORKER_NAME: "youneek-pro-radarynk222" });
  assert.match(website, /youneek-pro-radarynk222/);
  assert.match(website, /Variables and Secrets/);
  assert.doesNotMatch(website, /not youneek-pro-radarynk222/);
});
