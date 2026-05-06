// dBZ color scale for NEXRAD reflectivity (NOAA standard)
const SCALE = [
  { dbz: 5, color: "#9ce0f5" },
  { dbz: 15, color: "#5cd5d5" },
  { dbz: 25, color: "#3acb3a" },
  { dbz: 35, color: "#fdfd54" },
  { dbz: 45, color: "#fda835" },
  { dbz: 55, color: "#fb3030" },
  { dbz: 65, color: "#cb38d4" },
  { dbz: 75, color: "#ffffff" },
];

export default function RadarLegend() {
  return (
    <div className="absolute left-3 bottom-24 z-10 rounded-2xl border border-border/60 glass-strong px-3 py-2.5">
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">dBZ</div>
      <div className="flex flex-col gap-0.5">
        {SCALE.map((s) => (
          <div key={s.dbz} className="flex items-center gap-2">
            <div className="h-2.5 w-5 rounded-sm" style={{ background: s.color }} />
            <span className="text-[10px] tabular-nums text-foreground/80">{s.dbz}</span>
          </div>
        ))}
      </div>
    </div>
  );
}