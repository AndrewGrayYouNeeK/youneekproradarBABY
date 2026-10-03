import { Link } from "react-router-dom";

function ago(iso) {
  const time = Date.parse(iso || "");
  if (!Number.isFinite(time)) return "";
  const seconds = Math.max(0, (Date.now() - time) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function when(iso) {
  const time = Date.parse(iso || "");
  if (!Number.isFinite(time)) return "No date";
  return new Date(time).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function matches(query, ...parts) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  return parts.join(" ").toLowerCase().includes(needle);
}

function StatusPill({ tone, children }) {
  const tones = {
    ok: "bg-emerald-400/15 text-emerald-200",
    warn: "bg-amber-300/15 text-amber-100",
    bad: "bg-red-400/15 text-red-200",
    idle: "bg-white/10 text-white/70",
  };
  return (
    <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${tones[tone] || tones.idle}`}>
      {children}
    </span>
  );
}

function agentTone(status) {
  if (["ACTIVE", "RUNNING", "IDLE"].includes(status)) return "ok";
  if (["ERROR", "FAILED"].includes(status)) return "bad";
  if (["FINISHED", "COMPLETED"].includes(status)) return "idle";
  return "warn";
}

export default function StackBoard({ snapshot, query, onQuery, refreshing, onRefresh, onLock }) {
  const { cloudflare, cursor, apple, preview, generatedAt } = snapshot;
  const certificates = apple?.appStore?.certificates || [];
  const expiring = certificates.filter((certificate) => certificate.expired || certificate.expiringSoon).length;
  const workersLive = (cloudflare?.workers || []).filter((worker) => worker.inAccount).length;
  const zonesLive = (cloudflare?.zones || []).filter((zone) => zone.inAccount).length;

  return (
    <div className="h-full overflow-y-auto bg-[#09090b] text-white">
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">YouNeeK</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight">Stack</h1>
            <p className="mt-1 text-sm text-white/50">
              Updated {ago(generatedAt) || "just now"}
              {preview ? " · preview data" : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/Forecast" className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/70">
              Weather
            </Link>
            <button type="button" onClick={onRefresh} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/80">
              {refreshing ? "Refreshing…" : "Refresh"}
            </button>
            <button type="button" onClick={onLock} className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-black">
              Lock
            </button>
          </div>
        </header>

        {preview && (
          <p className="mt-4 rounded-2xl border border-amber-200/20 bg-amber-200/10 px-4 py-3 text-sm text-amber-50">
            Preview data is on because this local server has STACK_FIXTURE=1 and no API tokens. Worker secrets replace this with the live account.
          </p>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat label="Workers" value={cloudflare?.connected ? workersLive : "—"} detail={cloudflare?.connected ? "in the account" : "not connected"} />
          <Stat label="Zones" value={cloudflare?.connected ? zonesLive : "—"} detail={cloudflare?.zones?.[0]?.name || "domains"} />
          <Stat label="Agents" value={cursor?.connected ? cursor.counts.active : "—"} detail={cursor?.connected ? `${cursor.counts.total} listed` : "not connected"} />
          <Stat label="Apple certs" value={apple?.appStore?.connected ? expiring : "—"} detail={apple?.appStore?.connected ? "expired or due in 30 days" : "not connected"} />
        </div>

        <label className="mt-5 block">
          <span className="sr-only">Filter the desk</span>
          <input
            value={query}
            onChange={(event) => onQuery(event.target.value)}
            placeholder="Filter workers, agents, apps, certificates"
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm outline-none ring-white/20 placeholder:text-white/30 focus:ring-2"
          />
        </label>

        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <Column kicker="Account" title="Cloudflare" accent="#f6821f">
            <ConnectNote
              connected={cloudflare?.connected}
              error={cloudflare?.error}
              missing={cloudflare?.missing}
              hint="Create a Cloudflare API token with Account, Workers Scripts, Workers Routes, Zone, and Pages read permission."
            />
            {cloudflare?.warnings?.map((warning) => (
              <p key={warning} className="rounded-2xl bg-amber-200/10 px-3 py-2 text-xs text-amber-100">{warning}</p>
            ))}
            {cloudflare?.accounts?.filter((account) => matches(query, account.name, account.id)).map((account) => (
              <Row key={account.id} title={account.name} meta="Account" />
            ))}
            {(cloudflare?.zones || []).filter((zone) => matches(query, zone.name, zone.status, zone.plan)).map((zone) => (
              <Row
                key={zone.name}
                title={zone.name}
                meta={zone.inAccount ? [zone.plan, zone.status].filter(Boolean).join(" · ") : "Expected zone"}
                pill={zone.missing ? <StatusPill tone="bad">Missing</StatusPill> : zone.paused ? <StatusPill tone="warn">Paused</StatusPill> : zone.inAccount ? <StatusPill tone="ok">{zone.status || "Active"}</StatusPill> : null}
              />
            ))}
            {(cloudflare?.workers || []).filter((worker) => matches(query, worker.name, worker.role, worker.url)).map((worker) => (
              <Row
                key={worker.name}
                title={worker.name}
                meta={[worker.role, worker.modifiedOn ? `edited ${ago(worker.modifiedOn)}` : ""].filter(Boolean).join(" · ")}
                href={worker.url}
                pill={worker.missing ? <StatusPill tone="bad">Missing</StatusPill> : worker.inAccount ? <StatusPill tone="ok">Live</StatusPill> : <StatusPill tone="idle">Expected</StatusPill>}
              />
            ))}
            {(cloudflare?.pages || []).filter((project) => matches(query, project.name, project.subdomain, project.deploymentStatus)).map((project) => (
              <Row
                key={project.name}
                title={project.name}
                meta={[project.productionBranch, project.deploymentStatus].filter(Boolean).join(" · ") || "Pages project"}
                href={project.url}
              />
            ))}
          </Column>

          <Column kicker="Agents" title="Cursor" accent="#d6d3d1">
            <ConnectNote
              connected={cursor?.connected}
              error={cursor?.error}
              missing={cursor?.missing}
              hint="Create a Cursor user API key from Dashboard → API Keys and store it as CURSOR_API_KEY."
            />
            <p className="px-1 text-xs leading-relaxed text-white/45">
              Environment {cursor?.environment}. Repo {cursor?.repository?.replace("https://github.com/", "")}.
            </p>
            {(cursor?.agents || []).filter((agent) => matches(query, agent.name, agent.status, agent.repository, agent.summary)).map((agent) => (
              <Row
                key={agent.id || agent.name}
                title={agent.name}
                meta={[agent.envType, ago(agent.updatedAt || agent.createdAt)].filter(Boolean).join(" · ")}
                href={agent.url}
                pill={<StatusPill tone={agentTone(agent.status)}>{agent.status}</StatusPill>}
              />
            ))}
            {cursor?.connected && cursor.agents.length === 0 && <p className="px-1 text-sm text-white/45">No agents came back from the API.</p>}
          </Column>

          <Column kicker="Developer" title="Apple" accent="#8ec5ff">
            <div className="rounded-2xl border border-white/10 bg-black/30 p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium">WeatherKit</p>
                <StatusPill tone={apple?.weatherKit?.configured ? "ok" : "warn"}>
                  {apple?.weatherKit?.configured ? "Configured" : "Incomplete"}
                </StatusPill>
              </div>
              <dl className="mt-3 space-y-1 text-xs text-white/60">
                <IdLine label="Team" value={apple?.weatherKit?.teamId} />
                <IdLine label="Key" value={apple?.weatherKit?.keyId} />
                <IdLine label="Service" value={apple?.weatherKit?.serviceId || snapshot.catalog?.apple?.serviceId} />
              </dl>
              {apple?.weatherKit?.missing?.length > 0 && (
                <ul className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed text-white/45">
                  {apple.weatherKit.missing.map((name) => (
                    <li key={name}>{name}</li>
                  ))}
                </ul>
              )}
            </div>
            <ConnectNote
              connected={apple?.appStore?.connected}
              error={apple?.appStore?.error}
              missing={apple?.appStore?.missing}
              hint="App Store Connect needs an Issuer ID plus a key with access to apps, bundle IDs, and certificates."
            />
            {(apple?.appStore?.apps || []).filter((app) => matches(query, app.name, app.bundleId, app.sku)).map((app) => (
              <Row key={app.id || app.bundleId} title={app.name} meta={app.bundleId} />
            ))}
            {(apple?.appStore?.bundleIds || []).filter((bundle) => matches(query, bundle.name, bundle.identifier, bundle.platform)).map((bundle) => (
              <Row key={bundle.id || bundle.identifier} title={bundle.identifier || bundle.name} meta={bundle.platform || bundle.name} />
            ))}
            {certificates.filter((certificate) => matches(query, certificate.name, certificate.type)).map((certificate) => (
              <Row
                key={certificate.id || certificate.name}
                title={certificate.name}
                meta={`${certificate.type || "Certificate"} · ${when(certificate.expirationDate)}`}
                pill={certificate.expired ? <StatusPill tone="bad">Expired</StatusPill> : certificate.expiringSoon ? <StatusPill tone="warn">Expiring</StatusPill> : <StatusPill tone="ok">Valid</StatusPill>}
              />
            ))}
          </Column>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, detail }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.03] px-4 py-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-white/40">{label}</p>
      <p className="mt-1 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="text-xs text-white/45">{detail}</p>
    </div>
  );
}

function Column({ kicker, title, accent, children }) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.03] p-4">
      <header className="mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
        <div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-white/35">{kicker}</p>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        </div>
      </header>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Row({ title, meta = "", href = "", pill = null }) {
  const body = (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-3 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium">{title}</p>
        {meta && <p className="truncate text-xs text-white/45">{meta}</p>}
      </div>
      {pill}
    </div>
  );
  if (!href) return body;
  return (
    <a href={href} target="_blank" rel="noreferrer" className="block rounded-2xl outline-none ring-white/30 focus:ring-2">
      {body}
    </a>
  );
}

function ConnectNote({ connected = false, error = "", missing = [], hint = "" }) {
  if (connected && !error) return null;
  return (
    <div className="rounded-2xl border border-dashed border-white/15 px-3 py-3 text-xs leading-relaxed text-white/60">
      {error ? <p className="text-red-200">{error}</p> : <p>{hint}</p>}
      {missing?.length > 0 && (
        <ul className="mt-2 space-y-1 font-mono text-[11px] text-white/45">
          {missing.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

function IdLine({ label, value = "" }) {
  return (
    <div className="flex justify-between gap-3">
      <dt>{label}</dt>
      <dd className="truncate font-mono text-white/80">{value || "—"}</dd>
    </div>
  );
}
