import { siteRoleFromEnv } from "../site.js";
import { authorizeStack } from "./access.js";
import { stackCatalog } from "./catalog.js";
import {
  loadApple,
  loadCloudflare,
  loadCursor,
  previewSources,
  weatherKitDeskStatus,
} from "./providers.js";
import {
  mergeNamed,
  normalizeAppleLists,
  normalizeCursorPayload,
  normalizePagesProject,
  normalizeWorkerScript,
  normalizeZone,
} from "./normalize.js";

function present(value) {
  return Boolean(String(value ?? "").trim());
}

export function shouldUsePreview(env = {}) {
  if (String(env.STACK_FIXTURE || "") !== "1") return false;
  if (siteRoleFromEnv(env) !== "local") return false;
  if (present(env.CLOUDFLARE_API_TOKEN) || present(env.CURSOR_API_KEY) || present(env.APPLE_ISSUER_ID)) return false;
  return true;
}

function previewSnapshot(env, now = Date.now()) {
  const catalog = stackCatalog();
  const sources = previewSources(now);
  const workers = sources.cloudflareWorkers.map((script) => normalizeWorkerScript(script, {
    accountName: "YouNeeK",
    subdomain: "youneekartifacts",
    hostnames: script.id === "youneekproradarbaby" ? ["youneekproradar.com"] : [],
  }));
  const zones = sources.cloudflareZones.map(normalizeZone);
  const cursor = normalizeCursorPayload(sources.cursor);
  const appleLists = normalizeAppleLists({
    appsBody: sources.apps,
    bundleBody: sources.bundles,
    certsBody: sources.certificates,
    now,
  });
  return {
    preview: true,
    generatedAt: new Date(now).toISOString(),
    catalog,
    cloudflare: {
      connected: true,
      error: null,
      warnings: [],
      tokenStatus: "active",
      accounts: sources.cloudflareAccounts,
      zones: mergeNamed(catalog.cloudflare.zones.map((zone) => ({ ...zone, role: "Zone" })), zones.map((zone) => ({ ...zone, role: "Zone" })), true),
      workers: mergeNamed(catalog.cloudflare.workers, workers, true),
      pages: sources.cloudflarePages.map((project) => normalizePagesProject(project)),
      missing: [],
    },
    cursor: {
      connected: true,
      error: null,
      missing: [],
      environment: catalog.cursor.environment,
      repository: catalog.cursor.repository,
      ...cursor,
    },
    apple: {
      weatherKit: weatherKitDeskStatus(env),
      appStore: {
        connected: true,
        error: null,
        missing: [],
        ...appleLists,
      },
    },
  };
}

export async function loadStackSnapshot(env = {}, deps = {}) {
  const fetchImpl = deps.fetch || fetch;
  const now = deps.now || Date.now();
  if (shouldUsePreview(env)) return previewSnapshot(env, now);
  const catalog = stackCatalog();
  const [cloudflare, cursor, apple] = await Promise.all([
    loadCloudflare(env, fetchImpl, catalog),
    loadCursor(env, fetchImpl, catalog),
    loadApple(env, fetchImpl, now),
  ]);
  return {
    preview: false,
    generatedAt: new Date(now).toISOString(),
    catalog,
    cloudflare,
    cursor,
    apple,
  };
}

export async function buildStackResponse(request, env = {}, deps = {}) {
  const auth = await authorizeStack(request, env);
  if (!auth.ok) {
    return {
      status: auth.reason === "missing_access_key" ? 503 : 401,
      body: {
        ok: false,
        locked: true,
        reason: auth.reason,
        catalog: stackCatalog(),
      },
    };
  }
  const snapshot = await loadStackSnapshot(env, deps);
  return { status: 200, body: { ok: true, ...snapshot } };
}
