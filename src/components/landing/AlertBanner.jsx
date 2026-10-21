import { formatAlertExpires } from "@/lib/landing/briefing";

const SEVERITY_CLASS = {
  Extreme: "border-[#ff0033] bg-[#ff0033]/15",
  Severe: "border-[#ff7a18] bg-[#ff7a18]/15",
  Moderate: "border-[#ffd400] bg-[#ffd400]/10",
  Minor: "border-sky-300 bg-sky-300/10",
  Unknown: "border-white/30 bg-black/70",
};

export default function AlertBanner({ alerts, state }) {
  if (state === "loading") {
    return (
      <div className="border border-white/20 bg-black/70 px-4 py-3 text-sm text-white/80">
        Checking National Weather Service alerts…
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="border border-[#ffd400] bg-black/80 px-4 py-3 text-sm text-white">
        NWS alerts could not be loaded.{" "}
        <a className="underline" href="https://www.weather.gov" target="_blank" rel="noreferrer">
          Open weather.gov
        </a>
      </div>
    );
  }

  if (!alerts.length) {
    return (
      <div className="border border-[#00ff9c]/40 bg-black/70 px-4 py-3 text-sm text-white">
        No active NWS alerts for this location.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <article
          key={alert.id}
          className={`border-2 px-4 py-3 ${SEVERITY_CLASS[alert.severity] || SEVERITY_CLASS.Unknown}`}
        >
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
            {alert.severity} · {alert.event}
          </div>
          <h2 className="mt-1 text-base font-bold leading-snug text-white md:text-lg">{alert.headline}</h2>
          <p className="mt-1 text-xs text-white/70">Expires {formatAlertExpires(alert.expires)}</p>
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-white">
            {alert.instruction || "Follow local officials and the full alert."}
          </p>
          <a className="mt-2 inline-flex min-h-11 items-center text-sm font-bold text-[#00ff9c] underline" href={alert.url} target="_blank" rel="noreferrer">
            Alert details
          </a>
        </article>
      ))}
    </div>
  );
}
