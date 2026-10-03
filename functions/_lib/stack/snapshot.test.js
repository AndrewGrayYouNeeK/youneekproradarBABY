import assert from "node:assert/strict";
import { generateKeyPairSync } from "node:crypto";
import test from "node:test";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeJwt, decodeProtectedHeader } from "jose";
import { authorizeStack } from "./access.js";
import { stackCatalog } from "./catalog.js";
import { certificateTiming, normalizeCursorPayload } from "./normalize.js";
import { createAppStoreToken } from "./providers.js";
import { buildStackResponse, shouldUsePreview } from "./snapshot.js";

const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

function request(key) {
  return new Request("https://youneekproradar.com/api/stack", {
    headers: key ? { Authorization: `Bearer ${key}` } : {},
  });
}

test("catalog names the weather worker, landing worker, and public zone", () => {
  const catalog = stackCatalog();
  assert.deepEqual(catalog.cloudflare.workers.map((worker) => worker.name), [
    "youneekproradarbaby",
    "youneek-pro-radarynk222",
  ]);
  assert.equal(catalog.cloudflare.zones[0].name, "youneekproradar.com");
  assert.equal(catalog.apple.serviceId, "com.youneek.proradar.weather");
});

test("stack stays locked until the access key matches", async () => {
  assert.equal((await authorizeStack(request(""), {})).reason, "missing_access_key");
  assert.equal((await authorizeStack(request("nope"), { STACK_ACCESS_KEY: "desk-key" })).reason, "denied");
  assert.equal((await authorizeStack(request("desk-key"), { STACK_ACCESS_KEY: "desk-key" })).ok, true);
});

test("locked responses do not call upstream APIs", async () => {
  let calls = 0;
  const fetchImpl = () => {
    calls += 1;
    throw new Error("should not fetch");
  };
  const missing = await buildStackResponse(request(""), {
    STACK_ACCESS_KEY: "",
    CLOUDFLARE_API_TOKEN: "super-secret-token",
  }, { fetch: fetchImpl });
  assert.equal(missing.status, 503);
  assert.equal(missing.body.reason, "missing_access_key");
  assert.equal(JSON.stringify(missing.body).includes("super-secret-token"), false);

  const denied = await buildStackResponse(request("wrong"), {
    STACK_ACCESS_KEY: "desk-key",
    CURSOR_API_KEY: "cursor-secret",
  }, { fetch: fetchImpl });
  assert.equal(denied.status, 401);
  assert.equal(calls, 0);
});

test("a matching key loads Cloudflare, Cursor, and Apple records without echoing secrets", async () => {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" });
  const env = {
    STACK_ACCESS_KEY: "desk-key",
    CLOUDFLARE_API_TOKEN: "cf-token-value",
    CURSOR_API_KEY: "cursor-key-value",
    APPLE_ISSUER_ID: "issuer-id",
    APPLE_KEY_ID: "KEYID12345",
    APPLE_PRIVATE_KEY: pem,
    WEATHERKIT_TEAM_ID: "TEAMID1234",
    WEATHERKIT_KEY_ID: "WKKEY12345",
    WEATHERKIT_SERVICE_ID: "com.youneek.proradar.weather",
    WEATHERKIT_PRIVATE_KEY: pem,
  };

  const fetchImpl = async (url, init) => {
    const href = String(url);
    assert.equal(JSON.stringify(init).includes("BEGIN PRIVATE KEY"), false);
    if (href.endsWith("/user/tokens/verify")) return json({ success: true, result: { status: "active" } });
    if (href.endsWith("/accounts?per_page=20")) {
      return json({ success: true, result: [{ id: "acct1", name: "YouNeeK" }] });
    }
    if (href.endsWith("/zones?per_page=50")) {
      return json({ success: true, result: [{ id: "z1", name: "youneekproradar.com", status: "active", paused: false, plan: { name: "Free" } }] });
    }
    if (href.endsWith("/workers/subdomain")) return json({ success: true, result: { subdomain: "youneekartifacts" } });
    if (href.endsWith("/workers/domains")) {
      return json({ success: true, result: [{ service: "youneekproradarbaby", hostname: "youneekproradar.com" }] });
    }
    if (href.endsWith("/workers/scripts")) {
      return json({ success: true, result: [{ id: "youneekproradarbaby", created_on: "2026-01-01T00:00:00Z", modified_on: "2026-10-01T00:00:00Z" }] });
    }
    if (href.endsWith("/pages/projects")) {
      return json({ success: true, result: [{ name: "radar-pages", subdomain: "radar-pages", domains: [], production_branch: "main" }] });
    }
    if (href.startsWith("https://api.cursor.com/")) {
      assert.match(init.headers.Authorization, /^Basic /);
      return json({
        agents: [
          { id: "bc_1", name: "Fix radar", status: "RUNNING", createdAt: "2026-10-01T00:00:00Z", source: { repository: "https://github.com/AndrewGrayYouNeeK/youneek-pro-radar" }, target: { url: "https://cursor.com/agents/bc_1" } },
        ],
      });
    }
    if (href.startsWith("https://api.appstoreconnect.apple.com/v1/apps")) {
      return json({ data: [{ id: "app1", attributes: { name: "YouNeeK Pro Radar", bundleId: "com.youneek.proradar", sku: "PR", primaryLocale: "en-US" } }] });
    }
    if (href.includes("/bundleIds")) {
      return json({ data: [{ id: "bid", attributes: { name: "Weather", identifier: "com.youneek.proradar.weather", platform: "SERVICES" } }] });
    }
    if (href.includes("/certificates")) {
      return json({ data: [{ id: "cert", attributes: { displayName: "Dev", certificateType: "APPLE_DEVELOPMENT", expirationDate: "2020-01-01T00:00:00Z", certificateContent: "SECRET-CERT" } }] });
    }
    throw new Error(`unexpected ${href}`);
  };

  const result = await buildStackResponse(request("desk-key"), env, { fetch: fetchImpl, now: Date.parse("2026-10-03T00:00:00Z") });
  assert.equal(result.status, 200);
  assert.equal(result.body.cloudflare.accounts[0].name, "YouNeeK");
  assert.equal(result.body.cloudflare.workers.find((worker) => worker.name === "youneekproradarbaby").url, "https://youneekproradar.com");
  assert.equal(result.body.cloudflare.workers.find((worker) => worker.name === "youneek-pro-radarynk222").missing, true);
  assert.equal(result.body.cloudflare.pages[0].name, "radar-pages");
  assert.equal(result.body.cursor.counts.active, 1);
  assert.equal(result.body.cursor.agents[0].url, "https://cursor.com/agents/bc_1");
  assert.equal(result.body.apple.weatherKit.configured, true);
  assert.equal(result.body.apple.weatherKit.teamId, "TEAMID1234");
  assert.equal(result.body.apple.appStore.apps[0].bundleId, "com.youneek.proradar");
  assert.equal(result.body.apple.appStore.certificates[0].expired, true);
  const encoded = JSON.stringify(result.body);
  assert.equal(encoded.includes("cf-token-value"), false);
  assert.equal(encoded.includes("cursor-key-value"), false);
  assert.equal(encoded.includes("BEGIN PRIVATE KEY"), false);
  assert.equal(encoded.includes("SECRET-CERT"), false);
});

test("preview data is local only and stays off when a real token is present", () => {
  assert.equal(shouldUsePreview({ STACK_FIXTURE: "1", SITE_ROLE: "local" }), true);
  assert.equal(shouldUsePreview({ STACK_FIXTURE: "1", SITE_ROLE: "weather" }), false);
  assert.equal(shouldUsePreview({ STACK_FIXTURE: "1", SITE_ROLE: "local", CURSOR_API_KEY: "real" }), false);
});

test("local preview does not call the network", async () => {
  let calls = 0;
  const result = await buildStackResponse(request("desk-key"), {
    STACK_ACCESS_KEY: "desk-key",
    STACK_FIXTURE: "1",
    SITE_ROLE: "local",
  }, {
    fetch: () => {
      calls += 1;
      throw new Error("network");
    },
    now: Date.parse("2026-10-03T00:00:00Z"),
  });
  assert.equal(calls, 0);
  assert.equal(result.body.preview, true);
  assert.equal(result.body.cloudflare.workers.some((worker) => worker.name === "youneekproradarbaby" && worker.inAccount), true);
  assert.equal(result.body.apple.appStore.certificates.some((certificate) => certificate.expiringSoon), true);
});

test("cursor list accepts the v1 items shape", () => {
  const normalized = normalizeCursorPayload({
    items: [{ id: "bc-1", name: "Desk", status: "ACTIVE", url: "https://cursor.com/agents/bc-1", env: { type: "cloud" } }],
  });
  assert.equal(normalized.counts.active, 1);
  assert.equal(normalized.agents[0].envType, "cloud");
});

test("certificate timing flags expired and soon-to-expire dates", () => {
  const now = Date.parse("2026-10-03T00:00:00Z");
  assert.equal(certificateTiming("2026-10-01T00:00:00Z", now).expired, true);
  assert.equal(certificateTiming("2026-10-20T00:00:00Z", now).expiringSoon, true);
  assert.equal(certificateTiming("2027-05-01T00:00:00Z", now).expiringSoon, false);
});

test("app store token names the key and audience without the private key", async () => {
  const { privateKey } = generateKeyPairSync("ec", { namedCurve: "P-256" });
  const pem = privateKey.export({ type: "pkcs8", format: "pem" });
  const token = await createAppStoreToken({
    APPLE_ISSUER_ID: "issuer-id",
    APPLE_KEY_ID: "KEYID12345",
    APPLE_PRIVATE_KEY: pem,
  });
  assert.equal(decodeProtectedHeader(token).kid, "KEYID12345");
  const claims = decodeJwt(token);
  assert.equal(claims.iss, "issuer-id");
  assert.equal(claims.aud, "appstoreconnect-v1");
  assert.equal(token.includes(pem), false);
});

test("worker routes the stack desk API", () => {
  const worker = readFileSync(join(root, "worker/index.js"), "utf8");
  assert.match(worker, /\/api\/stack/);
});

function json(body) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
