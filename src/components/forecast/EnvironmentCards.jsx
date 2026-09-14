import { Flower2, Wind } from "lucide-react";

function pollenLevel(value) {
  if (value == null) return { label: "n/a", tone: "text-slate-400" };
  if (value >= 50) return { label: "Very High", tone: "text-red-300" };
  if (value >= 20) return { label: "High", tone: "text-orange-300" };
  if (value >= 8) return { label: "Moderate", tone: "text-amber-200" };
  return { label: "Low", tone: "text-emerald-200" };
}

function aqiLevel(value) {
  if (value == null) return { label: "n/a", tone: "text-slate-400" };
  if (value >= 151) return { label: "Unhealthy", tone: "text-red-300" };
  if (value >= 101) return { label: "Sensitive", tone: "text-orange-300" };
  if (value >= 51) return { label: "Fair", tone: "text-amber-200" };
  return { label: "Good", tone: "text-emerald-200" };
}

export default function EnvironmentCards({ data }) {
  const pollen = pollenLevel(data?.pollen);
  const aqi = aqiLevel(data?.aqi);
  const triggers = data?.pollenTriggers?.length ? data.pollenTriggers.join(", ") : "No dominant pollen";

  return (
    <section className="grid grid-cols-1 gap-3">
      <article className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
          Pollen
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-500/15 text-red-300">
            <Flower2 className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-semibold text-white">
              {data?.pollen != null ? Math.round(data.pollen) : "—"} <span className={`text-sm ${pollen.tone}`}>| {pollen.label}</span>
            </div>
            <div className="text-xs text-white/75">{triggers}</div>
          </div>
        </div>
      </article>
      <article className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.16em] text-white/75">
          Air you breathe
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sky-400/25 text-white">
            <Wind className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <div className="text-xl font-semibold text-white">
              {data?.aqi != null ? Math.round(data.aqi) : "—"} <span className={`text-sm ${aqi.tone}`}>| {aqi.label}</span>
            </div>
            <div className="text-xs text-white/75">
              {data?.pm25 != null ? `PM2.5 ${Math.round(data.pm25)} µg/m³` : "PM2.5 unavailable"}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
}
