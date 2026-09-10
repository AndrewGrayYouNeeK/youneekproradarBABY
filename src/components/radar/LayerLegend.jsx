import { LEGENDS } from "@/lib/weather/mapLayers";

export default function LayerLegend({ legendKey, label }) {
  const items = LEGENDS[legendKey];
  if (!items?.length) return null;

  return (
    <div
      className="pointer-events-none absolute z-[1000] rounded-2xl border border-white/10 bg-slate-950/75 px-2.5 py-2 backdrop-blur-md"
      style={{ bottom: "calc(9.5rem + env(safe-area-inset-bottom))", left: "0.75rem" }}
      aria-label={`${label} legend`}
    >
      <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">{label}</div>
      <div className="flex flex-col gap-1">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="h-2.5 w-5 rounded-sm" style={{ background: item.color }} />
            <span className="text-[10px] text-slate-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
