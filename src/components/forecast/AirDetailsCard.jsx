export default function AirDetailsCard({ air }) {
  if (!air) return null;

  const rows = [
    ["PM2.5", air.pm25 != null ? `${Number(air.pm25).toFixed(1)} µg/m³` : "—"],
    ["PM10", air.pm10 != null ? `${Number(air.pm10).toFixed(1)} µg/m³` : "—"],
    ["Ozone", air.ozone != null ? `${Math.round(air.ozone)} µg/m³` : "—"],
    ["NO₂", air.no2 != null ? `${Math.round(air.no2)} µg/m³` : "—"],
    ["SO₂", air.so2 != null ? `${Math.round(air.so2)} µg/m³` : "—"],
    ["Dust", air.dust != null ? `${Math.round(air.dust)} µg/m³` : "—"],
  ];

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Air quality details
      </h2>
      <div className="grid grid-cols-2 gap-2 rounded-2xl border border-white/10 bg-white/5 p-3">
        {rows.map(([label, value]) => (
          <div key={label} className="rounded-xl bg-black/20 px-3 py-2">
            <div className="text-[10px] uppercase tracking-[0.14em] text-slate-500">{label}</div>
            <div className="mt-1 text-sm text-white">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
