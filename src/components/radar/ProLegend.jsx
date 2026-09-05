const REFLECTIVITY_GRADIENT =
  "linear-gradient(90deg, #38bdf8 0%, #22c55e 28%, #eab308 52%, #f97316 72%, #ef4444 88%, #d946ef 100%)";

export default function ProLegend({ productLabel, embedded = false }) {
  const label = productLabel || "Reflectivity";

  if (embedded) {
    return (
      <div className="border-t border-white/5 px-3 pb-3 pt-1.5" aria-label="Radar color legend">
        <div className="mb-1 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
          <span>Light</span>
          <span className="normal-case tracking-normal text-slate-400">{label}</span>
          <span>Severe</span>
        </div>
        <div className="h-1.5 w-full rounded-full" style={{ background: REFLECTIVITY_GRADIENT }} />
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>Rain</span>
          <span>Mixed</span>
          <span>Snow</span>
        </div>
      </div>
    );
  }

  return (
    <div
      className="pointer-events-none absolute z-[1000]"
      style={{ top: "5.5rem", left: "0.75rem" }}
      aria-label="Radar color legend"
    >
      <div className="w-36 rounded-2xl border border-white/10 bg-[#10151c]/88 p-2.5 shadow-xl backdrop-blur-md">
        <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
          {label}
        </div>
        <div className="h-1.5 w-full rounded-full" style={{ background: REFLECTIVITY_GRADIENT }} />
        <div className="mt-1 flex justify-between text-[10px] text-slate-500">
          <span>Light</span>
          <span>Severe</span>
        </div>
      </div>
    </div>
  );
}
