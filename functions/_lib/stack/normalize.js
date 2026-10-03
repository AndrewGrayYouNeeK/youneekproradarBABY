const ACTIVE_AGENT = new Set(["ACTIVE", "RUNNING", "IDLE", "NOT_YET_STARTED", "WAITING_FOR_BACKGROUND_WORK"]);
const DONE_AGENT = new Set(["FINISHED", "COMPLETED", "ARCHIVED", "EXPIRED", "CANCELLED", "CANCELED"]);
const BAD_AGENT = new Set(["ERROR", "FAILED"]);
const EXPIRING_MS = 30 * 24 * 60 * 60 * 1000;

export function safeError(error) {
  const message = error instanceof Error ? error.message : String(error || "Request failed");
  return message.replace(/\s+/g, " ").trim().slice(0, 240) || "Request failed";
}

export function certificateTiming(expirationDate, now = Date.now()) {
  const time = Date.parse(expirationDate || "");
  if (!Number.isFinite(time)) return { expired: false, expiringSoon: false };
  const expired = time < now;
  return {
    expired,
    expiringSoon: !expired && time - now <= EXPIRING_MS,
  };
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

export function mergeNamed(expected, live, connected, extra = {}) {
  const liveByName = new Map(live.map((item) => [item.name, item]));
  const seen = new Set();
  const rows = expected.map((item) => {
    seen.add(item.name);
    const found = liveByName.get(item.name);
    return {
      ...extra,
      ...item,
      ...(found || {}),
      name: item.name,
      role: item.role || found?.role || extra.role || "",
      url: found?.url || item.url || "",
      expected: true,
      inAccount: Boolean(found),
      missing: Boolean(connected && !found),
    };
  });
  for (const item of live) {
    if (seen.has(item.name)) continue;
    rows.push({
      ...extra,
      ...item,
      expected: false,
      inAccount: true,
      missing: false,
    });
  }
  return rows;
}

export function normalizeZone(zone) {
  return {
    id: String(zone?.id || ""),
    name: String(zone?.name || ""),
    status: String(zone?.status || "unknown"),
    paused: Boolean(zone?.paused),
    plan: String(zone?.plan?.name || zone?.plan || ""),
  };
}

export function normalizeWorkerScript(script, { accountName = "", subdomain = "", hostnames = [] } = {}) {
  const name = String(script?.id || script?.name || "");
  const hosts = hostnames.filter(Boolean);
  const workersDev = subdomain && name ? `https://${name}.${subdomain}.workers.dev` : "";
  return {
    name,
    role: "Worker",
    accountName,
    createdOn: script?.created_on || script?.createdOn || null,
    modifiedOn: script?.modified_on || script?.modifiedOn || null,
    url: hosts[0] ? `https://${hosts[0]}` : workersDev,
    hostnames: hosts,
  };
}

export function normalizePagesProject(project, accountName = "") {
  const domains = asArray(project?.domains).map((domain) => String(domain)).filter(Boolean);
  const subdomain = String(project?.subdomain || "");
  const stage = project?.latest_deployment?.latest_stage || {};
  return {
    name: String(project?.name || ""),
    accountName,
    subdomain,
    domains,
    productionBranch: String(project?.production_branch || ""),
    url: domains[0] ? `https://${domains[0]}` : subdomain ? `https://${subdomain}.pages.dev` : "",
    deploymentStatus: String(stage?.status || ""),
    deploymentAt: project?.latest_deployment?.created_on || null,
  };
}

export function normalizeCursorAgent(agent) {
  const status = String(agent?.status || "UNKNOWN").toUpperCase();
  return {
    id: String(agent?.id || ""),
    name: String(agent?.name || "Untitled agent"),
    status,
    url: String(agent?.url || agent?.target?.url || ""),
    createdAt: agent?.createdAt || agent?.created_at || null,
    updatedAt: agent?.updatedAt || agent?.updated_at || agent?.createdAt || null,
    envType: String(agent?.env?.type || agent?.envType || ""),
    repository: String(agent?.source?.repository || agent?.repos?.[0]?.url || ""),
    summary: String(agent?.summary || "").replace(/\s+/g, " ").trim().slice(0, 180),
  };
}

export function countAgents(agents) {
  return agents.reduce(
    (counts, agent) => {
      counts.total += 1;
      if (ACTIVE_AGENT.has(agent.status)) counts.active += 1;
      else if (BAD_AGENT.has(agent.status)) counts.error += 1;
      else if (DONE_AGENT.has(agent.status)) counts.finished += 1;
      else counts.other += 1;
      return counts;
    },
    { total: 0, active: 0, finished: 0, error: 0, other: 0 }
  );
}

export function normalizeCursorPayload(body) {
  const items = asArray(body?.items).length ? body.items : asArray(body?.agents);
  const agents = items.map(normalizeCursorAgent).filter((agent) => agent.id || agent.name);
  return {
    agents,
    counts: countAgents(agents),
    nextCursor: body?.nextCursor ? String(body.nextCursor) : "",
  };
}

export function normalizeApp(app) {
  const attributes = app?.attributes || {};
  return {
    id: String(app?.id || ""),
    name: String(attributes.name || "Untitled app"),
    bundleId: String(attributes.bundleId || ""),
    sku: String(attributes.sku || ""),
    primaryLocale: String(attributes.primaryLocale || ""),
  };
}

export function normalizeBundleId(bundle) {
  const attributes = bundle?.attributes || {};
  return {
    id: String(bundle?.id || ""),
    name: String(attributes.name || attributes.identifier || "Bundle ID"),
    identifier: String(attributes.identifier || ""),
    platform: String(attributes.platform || ""),
  };
}

export function normalizeCertificate(certificate, now = Date.now()) {
  const attributes = certificate?.attributes || {};
  const expirationDate = attributes.expirationDate || null;
  return {
    id: String(certificate?.id || ""),
    name: String(attributes.displayName || attributes.name || "Certificate"),
    type: String(attributes.certificateType || ""),
    expirationDate,
    ...certificateTiming(expirationDate, now),
  };
}

export function normalizeAppleLists({ appsBody, bundleBody, certsBody, now }) {
  return {
    apps: asArray(appsBody?.data).map(normalizeApp).filter((app) => app.id || app.name),
    bundleIds: asArray(bundleBody?.data).map(normalizeBundleId).filter((bundle) => bundle.id || bundle.identifier),
    certificates: asArray(certsBody?.data).map((item) => normalizeCertificate(item, now)),
  };
}
