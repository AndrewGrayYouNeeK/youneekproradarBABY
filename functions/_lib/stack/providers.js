import { SignJWT, importPKCS8 } from "jose";
import { inspectWeatherKitEnv, normalizePrivateKey, trimSecret } from "../weatherkit-key.js";
import { stackCatalog } from "./catalog.js";
import {
  mergeNamed,
  normalizeAppleLists,
  normalizeCursorPayload,
  normalizePagesProject,
  normalizeWorkerScript,
  normalizeZone,
  safeError,
} from "./normalize.js";

const CF = "https://api.cloudflare.com/client/v4";
const CURSOR = "https://api.cursor.com/v1/agents?limit=50&includeArchived=true";
const ASC = "https://api.appstoreconnect.apple.com/v1";

function present(value) {
  return Boolean(String(value ?? "").trim());
}

async function readJson(response) {
  const text = await response.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return {};
  }
}

async function cloudflareRequest(fetchImpl, token, path) {
  const response = await fetchImpl(`${CF}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    signal: AbortSignal.timeout(12000),
  });
  const data = await readJson(response);
  if (!response.ok || data.success === false) {
    const message = data?.errors?.[0]?.message || `Cloudflare request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

function resultList(data) {
  return Array.isArray(data?.result) ? data.result : [];
}

export async function loadCloudflare(env, fetchImpl, catalog = stackCatalog()) {
  const token = trimSecret(env.CLOUDFLARE_API_TOKEN);
  const base = {
    connected: false,
    error: null,
    warnings: [],
    tokenStatus: "",
    accounts: [],
    zones: [],
    workers: mergeNamed(catalog.cloudflare.workers, [], false),
    pages: [],
    missing: token ? [] : ["CLOUDFLARE_API_TOKEN"],
  };
  if (!token) return base;

  try {
    const verify = await cloudflareRequest(fetchImpl, token, "/user/tokens/verify");
    const accountFilter = trimSecret(env.CLOUDFLARE_ACCOUNT_ID);
    const accountData = await cloudflareRequest(fetchImpl, token, "/accounts?per_page=20");
    let accounts = resultList(accountData).map((account) => ({
      id: String(account.id || ""),
      name: String(account.name || "Account"),
    })).filter((account) => account.id);
    if (accountFilter) accounts = accounts.filter((account) => account.id === accountFilter);

    let zones = [];
    try {
      const zoneData = await cloudflareRequest(fetchImpl, token, "/zones?per_page=50");
      zones = resultList(zoneData).map(normalizeZone).filter((zone) => zone.name);
    } catch (error) {
      base.warnings.push(`Zones: ${safeError(error)}`);
    }

    const workers = [];
    const pages = [];
    for (const account of accounts.slice(0, 3)) {
      let subdomain = "";
      try {
        const sub = await cloudflareRequest(fetchImpl, token, `/accounts/${encodeURIComponent(account.id)}/workers/subdomain`);
        subdomain = String(sub?.result?.subdomain || "");
      } catch {
        subdomain = "";
      }

      const hostnamesByScript = new Map();
      try {
        const domains = await cloudflareRequest(fetchImpl, token, `/accounts/${encodeURIComponent(account.id)}/workers/domains`);
        for (const domain of resultList(domains)) {
          const service = String(domain?.service || "");
          const hostname = String(domain?.hostname || "");
          if (!service || !hostname) continue;
          const list = hostnamesByScript.get(service) || [];
          list.push(hostname);
          hostnamesByScript.set(service, list);
        }
      } catch (error) {
        base.warnings.push(`Worker domains: ${safeError(error)}`);
      }

      try {
        const scripts = await cloudflareRequest(fetchImpl, token, `/accounts/${encodeURIComponent(account.id)}/workers/scripts`);
        for (const script of resultList(scripts)) {
          workers.push(normalizeWorkerScript(script, {
            accountName: account.name,
            subdomain,
            hostnames: hostnamesByScript.get(String(script?.id || "")) || [],
          }));
        }
      } catch (error) {
        base.warnings.push(`Workers: ${safeError(error)}`);
      }

      try {
        const projects = await cloudflareRequest(fetchImpl, token, `/accounts/${encodeURIComponent(account.id)}/pages/projects`);
        for (const project of resultList(projects)) {
          pages.push(normalizePagesProject(project, account.name));
        }
      } catch (error) {
        base.warnings.push(`Pages: ${safeError(error)}`);
      }
    }

    const mergedZones = mergeNamed(
      catalog.cloudflare.zones.map((zone) => ({ ...zone, role: "Zone" })),
      zones.map((zone) => ({ ...zone, role: "Zone" })),
      true
    );

    return {
      connected: true,
      error: null,
      warnings: base.warnings,
      tokenStatus: String(verify?.result?.status || ""),
      accounts,
      zones: mergedZones,
      workers: mergeNamed(catalog.cloudflare.workers, workers.filter((worker) => worker.name), true),
      pages: pages.filter((project) => project.name),
      missing: [],
    };
  } catch (error) {
    return {
      ...base,
      connected: false,
      error: safeError(error),
      missing: [],
    };
  }
}

function basicAuth(apiKey) {
  return `Basic ${btoa(`${apiKey}:`)}`;
}

export async function loadCursor(env, fetchImpl, catalog = stackCatalog()) {
  const apiKey = trimSecret(env.CURSOR_API_KEY);
  const known = {
    environment: catalog.cursor.environment,
    repository: catalog.cursor.repository,
  };
  if (!apiKey) {
    return {
      connected: false,
      error: null,
      missing: ["CURSOR_API_KEY"],
      agents: [],
      counts: { total: 0, active: 0, finished: 0, error: 0, other: 0 },
      ...known,
    };
  }

  try {
    const response = await fetchImpl(CURSOR, {
      headers: { Authorization: basicAuth(apiKey) },
      signal: AbortSignal.timeout(12000),
    });
    const data = await readJson(response);
    if (!response.ok) {
      throw new Error(response.status === 401 || response.status === 403
        ? "Cursor API key was rejected."
        : `Cursor request failed (${response.status})`);
    }
    const normalized = normalizeCursorPayload(data);
    return {
      connected: true,
      error: null,
      missing: [],
      ...known,
      ...normalized,
    };
  } catch (error) {
    return {
      connected: false,
      error: safeError(error),
      missing: [],
      agents: [],
      counts: { total: 0, active: 0, finished: 0, error: 0, other: 0 },
      ...known,
    };
  }
}

export async function createAppStoreToken(env) {
  const issuerId = trimSecret(env.APPLE_ISSUER_ID);
  const keyId = trimSecret(env.APPLE_KEY_ID);
  const pem = normalizePrivateKey(env.APPLE_PRIVATE_KEY);
  let privateKey;
  try {
    privateKey = await importPKCS8(pem, "ES256");
  } catch {
    throw new Error("Apple private key could not be read. Paste the full .p8, including BEGIN/END lines.");
  }
  return new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: keyId, typ: "JWT" })
    .setIssuer(issuerId)
    .setAudience("appstoreconnect-v1")
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(privateKey);
}

async function appStoreGet(fetchImpl, token, path) {
  const response = await fetchImpl(`${ASC}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(12000),
  });
  const data = await readJson(response);
  if (!response.ok) {
    const message = data?.errors?.[0]?.detail || data?.errors?.[0]?.title || `App Store Connect request failed (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export function weatherKitDeskStatus(env = {}) {
  const status = inspectWeatherKitEnv(env);
  return {
    configured: status.configured,
    project: status.project,
    teamId: trimSecret(env.WEATHERKIT_TEAM_ID),
    keyId: trimSecret(env.WEATHERKIT_KEY_ID),
    serviceId: trimSecret(env.WEATHERKIT_SERVICE_ID),
    privateKeyReady: Boolean(status.privateKeyLooksLikePem),
    secrets: status.secrets,
    missing: status.missing,
  };
}

export async function loadApple(env, fetchImpl, now = Date.now()) {
  const weatherKit = weatherKitDeskStatus(env);
  const issuer = present(env.APPLE_ISSUER_ID);
  const keyId = present(env.APPLE_KEY_ID);
  const privateKey = present(env.APPLE_PRIVATE_KEY);
  const missing = [
    !issuer && "APPLE_ISSUER_ID",
    !keyId && "APPLE_KEY_ID",
    !privateKey && "APPLE_PRIVATE_KEY",
  ].filter(Boolean);

  const appStore = {
    connected: false,
    error: null,
    missing,
    apps: [],
    bundleIds: [],
    certificates: [],
  };

  if (missing.length) {
    return { weatherKit, appStore };
  }

  try {
    const token = await createAppStoreToken(env);
    const [appsBody, bundleBody, certsBody] = await Promise.all([
      appStoreGet(fetchImpl, token, "/apps?limit=50"),
      appStoreGet(fetchImpl, token, "/bundleIds?limit=50"),
      appStoreGet(fetchImpl, token, "/certificates?limit=50"),
    ]);
    return {
      weatherKit,
      appStore: {
        connected: true,
        error: null,
        missing: [],
        ...normalizeAppleLists({ appsBody, bundleBody, certsBody, now }),
      },
    };
  } catch (error) {
    return {
      weatherKit,
      appStore: {
        ...appStore,
        missing: [],
        error: safeError(error),
      },
    };
  }
}

export function previewSources(now = Date.now()) {
  const soon = new Date(now + 12 * 24 * 60 * 60 * 1000).toISOString();
  const later = new Date(now + 200 * 24 * 60 * 60 * 1000).toISOString();
  return {
    cloudflareAccounts: [{ id: "preview-account", name: "YouNeeK" }],
    cloudflareZones: [{ id: "preview-zone", name: "youneekproradar.com", status: "active", paused: false, plan: { name: "Free" } }],
    cloudflareWorkers: [
      { id: "youneekproradarbaby", created_on: new Date(now - 80 * 86400000).toISOString(), modified_on: new Date(now - 2 * 3600000).toISOString() },
      { id: "youneek-pro-radarynk222", created_on: new Date(now - 60 * 86400000).toISOString(), modified_on: new Date(now - 26 * 3600000).toISOString() },
    ],
    cloudflarePages: [],
    cursor: {
      items: [
        {
          id: "bc-preview-radar",
          name: "Weather website deploy",
          status: "ACTIVE",
          url: "https://cursor.com/agents/bc-preview-radar",
          createdAt: new Date(now - 3 * 3600000).toISOString(),
          updatedAt: new Date(now - 20 * 60000).toISOString(),
          env: { type: "cloud" },
          repos: [{ url: "https://github.com/AndrewGrayYouNeeK/youneek-pro-radar" }],
        },
        {
          id: "bc-preview-landing",
          name: "Landing page copy",
          status: "FINISHED",
          url: "https://cursor.com/agents/bc-preview-landing",
          createdAt: new Date(now - 2 * 86400000).toISOString(),
          updatedAt: new Date(now - 2 * 86400000).toISOString(),
          env: { type: "cloud" },
        },
      ],
    },
    apps: {
      data: [
        { id: "preview-app", attributes: { name: "YouNeeK Pro Radar", bundleId: "com.youneek.proradar", sku: "PRORADAR", primaryLocale: "en-US" } },
      ],
    },
    bundles: {
      data: [
        { id: "preview-bundle", attributes: { name: "Pro Radar", identifier: "com.youneek.proradar", platform: "IOS" } },
        { id: "preview-service", attributes: { name: "WeatherKit", identifier: "com.youneek.proradar.weather", platform: "SERVICES" } },
      ],
    },
    certificates: {
      data: [
        { id: "preview-cert-soon", attributes: { displayName: "Apple Development", certificateType: "APPLE_DEVELOPMENT", expirationDate: soon } },
        { id: "preview-cert-ok", attributes: { displayName: "Apple Distribution", certificateType: "DISTRIBUTION", expirationDate: later } },
      ],
    },
  };
}
