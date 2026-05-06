import { Droplets } from "lucide-react";

export default function HourlyStrip({ hourly }) {
  if (!hourly?.properties?.periods) return null;
  const periods = hourly.properties.periods.slice(0, 24);

  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 p-3">
      <div className="mb-2 flex items-center justify-between px-1">
        <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">Next 24 Hours</div>
      </div>
      <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
        {periods.map((p, i) => {
          const time = new Date(p.startTime);
          const hour = time.getHours();
          const label = i === 0 ? "Now" : time.toLocaleTimeString([], { hour: "numeric" });
          const pop = p.probabilityOfPrecipitation?.value ?? 0;
          return (
            <div key={i} className="flex min-w-[64px] flex-col items-center gap-1.5 rounded-xl bg-secondary/40 px-2 py-2.5">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</span>
              <div className="text-base font-semibold tabular-nums">{p.temperature}°</div>
              <div className={`flex items-center gap-0.5 text-[10px] ${pop > 30 ? "text-primary" : "text-muted-foreground"}`}>
                <Droplets className="h-3 w-3" />
                {pop}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}