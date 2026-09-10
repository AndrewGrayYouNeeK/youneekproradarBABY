import { describeAqi, describeHeat, describePollen, describeUv, predominantPollen } from "@/lib/weather/lifestyle";
import { formatTemp } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";

export default function LifestyleStrip({ air, heatF }) {
  const { units } = useUnits();
  const aqi = describeAqi(air?.usAqi);
  const uv = describeUv(air?.uv);
  const pollen = describePollen(air?.pollenMax);
  const heat = describeHeat(heatF);
  const triggers = predominantPollen(air?.pollen);

  return (
    <section className="grid grid-cols-2 gap-3">
      <Card title="Air quality" value={air?.usAqi != null ? Math.round(air.usAqi) : "—"} detail={aqi.label} tone={aqi.color} />
      <Card
        title="Pollen"
        value={pollen.label}
        detail={triggers?.length ? triggers.map((item) => item.name).join(", ") : "No major triggers"}
        tone={pollen.color}
      />
      <Card title="UV index" value={air?.uv != null ? Number(air.uv).toFixed(1) : "—"} detail={uv.label} tone={uv.color} />
      <Card title="Heat index" value={formatTemp(heatF, units.temp)} detail={heat.label} tone={heat.color} />
    </section>
  );
}

function Card({ title, value, detail, tone }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{title}</div>
      <div className={`mt-1 text-lg font-semibold text-${tone}-300 text-white`}>{value}</div>
      <div className="mt-1 text-[11px] leading-snug text-slate-400">{detail}</div>
    </div>
  );
}
