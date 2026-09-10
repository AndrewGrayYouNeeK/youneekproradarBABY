import { aqiLabel, pollenLabel } from "@/lib/weather/lifestyle";

export default function AirQualityCard({ air }) {
  if (!air) return null;
  const aqi = aqiLabel(air.aqi);
  const pollen = pollenLabel(air.pollen);

  return (
    <section className="grid grid-cols-2 gap-3">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Air quality</div>
        <div className="mt-2 text-3xl font-light text-white">{air.aqi ?? "—"}</div>
        <div className={`mt-1 text-xs ${aqi.tone}`}>{aqi.label}</div>
        <div className="mt-3 space-y-1 text-[11px] text-slate-500">
          <div>PM2.5 {air.pm25 != null ? Math.round(air.pm25) : "—"}</div>
          <div>Ozone {air.ozone != null ? Math.round(air.ozone) : "—"}</div>
        </div>
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Pollen</div>
        <div className="mt-2 text-3xl font-light text-white">{Math.round(air.pollen || 0)}</div>
        <div className={`mt-1 text-xs ${pollen.tone}`}>{pollen.label}</div>
        <div className="mt-3 space-y-1 text-[11px] text-slate-500">
          <div>Grass {air.grass ?? "—"}</div>
          <div>Ragweed {air.ragweed ?? "—"}</div>
        </div>
      </div>
    </section>
  );
}
