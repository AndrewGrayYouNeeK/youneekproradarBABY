import { degToCardinal } from "@/lib/weather/conditions";

export default function WindDial({ speedMph = 0, directionDeg = 0, gustMph }) {
  const speed = Math.round(speedMph || 0);
  const rotation = Number.isFinite(directionDeg) ? directionDeg : 0;
  const cardinal = degToCardinal(directionDeg);

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
      <div className="relative h-24 w-24 shrink-0">
        <svg viewBox="0 0 100 100" className="h-full w-full">
          <circle cx="50" cy="50" r="46" fill="#0b1220" stroke="rgba(255,255,255,0.12)" strokeWidth="2" />
          {Array.from({ length: 12 }).map((_, index) => {
            const angle = (index / 12) * Math.PI * 2;
            const x1 = 50 + Math.sin(angle) * 38;
            const y1 = 50 - Math.cos(angle) * 38;
            const x2 = 50 + Math.sin(angle) * 44;
            const y2 = 50 - Math.cos(angle) * 44;
            return <line key={index} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />;
          })}
          <text x="50" y="18" textAnchor="middle" fill="#e2e8f0" fontSize="9" fontWeight="700">N</text>
          <g transform={`rotate(${rotation} 50 50)`}>
            <polygon points="50,16 55,48 45,48" fill="#ef4444" />
            <polygon points="50,84 55,52 45,52" fill="rgba(255,255,255,0.35)" />
          </g>
          <circle cx="50" cy="50" r="16" fill="#f8fafc" />
          <text x="50" y="54" textAnchor="middle" fill="#0b1220" fontSize="14" fontWeight="800">{speed}</text>
        </svg>
      </div>
      <div className="min-w-0">
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Wind</div>
        <div className="mt-1 text-2xl font-semibold text-white">{speed} mph</div>
        <div className="text-sm text-slate-300">{cardinal}{gustMph ? ` · Gusts ${Math.round(gustMph)}` : ""}</div>
      </div>
    </div>
  );
}
