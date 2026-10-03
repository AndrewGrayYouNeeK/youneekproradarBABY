import { useCallback, useEffect, useState } from "react";
import StackBoard from "@/components/stack/StackBoard";

const STORAGE_KEY = "youneek.stack.access";

async function readBody(response) {
  try {
    return await response.json();
  } catch {
    return { ok: false, error: "The desk returned an unreadable response." };
  }
}

export default function Stack() {
  const [accessKey, setAccessKey] = useState(() => sessionStorage.getItem(STORAGE_KEY) || "");
  const [draftKey, setDraftKey] = useState("");
  const [payload, setPayload] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => {
    const previous = document.title;
    document.title = "YouNeeK Stack";
    return () => {
      document.title = previous;
    };
  }, []);

  const load = useCallback(async (key, { quiet = false } = {}) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const headers = key ? { Authorization: `Bearer ${key}` } : {};
      const response = await fetch("/api/stack", { headers, cache: "no-store" });
      const body = await readBody(response);
      if (response.status === 401) {
        sessionStorage.removeItem(STORAGE_KEY);
        setAccessKey("");
        setPayload(body);
        if (key) setError("That access key was not accepted.");
        return;
      }
      if (!response.ok && response.status !== 503) {
        setError(body.error || "The desk could not load.");
        setPayload(body);
        return;
      }
      setPayload(body);
    } catch {
      setError("The desk could not be reached.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load(accessKey);
  }, [accessKey, load]);

  useEffect(() => {
    if (!payload?.ok) return undefined;
    const timer = setInterval(() => load(accessKey, { quiet: true }), 60000);
    return () => clearInterval(timer);
  }, [payload?.ok, accessKey, load]);

  function unlock(event) {
    event.preventDefault();
    const next = draftKey.trim();
    if (!next) return;
    sessionStorage.setItem(STORAGE_KEY, next);
    setAccessKey(next);
    setDraftKey("");
  }

  function lock() {
    sessionStorage.removeItem(STORAGE_KEY);
    setAccessKey("");
    setPayload(null);
    setQuery("");
  }

  if (loading && !payload) {
    return (
      <div className="flex h-full items-center justify-center bg-[#09090b] text-sm text-white/60">
        Opening the desk…
      </div>
    );
  }

  if (!payload?.ok) {
    return (
      <StackGate
        payload={payload}
        error={error}
        draftKey={draftKey}
        onDraft={setDraftKey}
        onUnlock={unlock}
      />
    );
  }

  return (
    <StackBoard
      snapshot={payload}
      query={query}
      onQuery={setQuery}
      refreshing={refreshing}
      onRefresh={() => load(accessKey, { quiet: true })}
      onLock={lock}
    />
  );
}

function StackGate({ payload, error, draftKey, onDraft, onUnlock }) {
  const needsSetup = payload?.reason === "missing_access_key";
  const catalog = payload?.catalog;

  return (
    <div className="h-full overflow-y-auto bg-[#09090b] text-white">
      <div className="mx-auto flex min-h-full max-w-lg flex-col justify-center px-5 py-12">
        <p className="text-[11px] font-medium uppercase tracking-[0.32em] text-white/40">YouNeeK</p>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">Stack</h1>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          One desk for the Cloudflare account, Cursor agents, and Apple Developer records behind YouNeeK Pro Radar.
        </p>

        {needsSetup ? (
          <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <h2 className="text-sm font-medium">Set an access key on the weather Worker</h2>
            <p className="mt-2 text-sm leading-relaxed text-white/60">
              Live account data stays on the Worker. The browser only sends the access key you choose.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl bg-black/50 p-3 text-[12px] leading-relaxed text-amber-100/90">{`npx wrangler secret put STACK_ACCESS_KEY
npx wrangler secret put CLOUDFLARE_API_TOKEN
npx wrangler secret put CURSOR_API_KEY
npx wrangler secret put APPLE_ISSUER_ID
npx wrangler secret put APPLE_KEY_ID
npx wrangler secret put APPLE_PRIVATE_KEY`}</pre>
          </div>
        ) : (
          <form onSubmit={onUnlock} className="mt-8 rounded-3xl border border-white/10 bg-white/[0.03] p-5">
            <label htmlFor="stack-key" className="text-sm font-medium">Access key</label>
            <input
              id="stack-key"
              type="password"
              autoComplete="current-password"
              value={draftKey}
              onChange={(event) => onDraft(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-black/40 px-3 py-3 text-sm outline-none ring-amber-200/40 placeholder:text-white/30 focus:ring-2"
              placeholder="Worker secret STACK_ACCESS_KEY"
            />
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
            <button
              type="submit"
              className="mt-4 w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-black"
            >
              Unlock desk
            </button>
          </form>
        )}

        {catalog && (
          <div className="mt-6 flex flex-wrap gap-2 text-xs text-white/55">
            {catalog.cloudflare.workers.map((worker) => (
              <span key={worker.name} className="rounded-full border border-white/10 px-3 py-1">{worker.name}</span>
            ))}
            <span className="rounded-full border border-white/10 px-3 py-1">{catalog.cloudflare.zones[0].name}</span>
            <span className="rounded-full border border-white/10 px-3 py-1">{catalog.apple.serviceId}</span>
          </div>
        )}
      </div>
    </div>
  );
}
