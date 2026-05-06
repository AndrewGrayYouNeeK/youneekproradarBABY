import { Droplets } from "lucide-react";

export default function DailyList({ daily }) {
  if (!daily?.properties?.periods) return null;

  // Group day/night pairs
  const periods = daily.properties.periods;
  const days = [];
  for (let i = 0; i < periods.length; i += 2) {
    const day = periods[i].isDaytime ? periods[i] : null;
    const night = day ? periods[i + 1] : periods[i];
    if (day) days.push({ day, night });
    else days.push({ day: null, night });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
      <div className="border-b border-border/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        7-Day Forecast
      </div>
      <ul className="divide-y divide-border/40">
        {days.slice(0, 7).map((d, i) => {
          const main = d.day || d.night;
          const dayName = i === 0 ? "Today" : new Date(main.startTime).toLocaleDateString([], { weekday: "short" });
          const pop = main.probabilityOfPrecipitation?.value ?? 0;
          return (
            <li key={i} className="flex items-center gap-3 px-4 py-3">
              <div className="w-12 text-sm font-medium">{dayName}</div>
              <div className="flex-1 truncate text-xs text-muted-foreground">{main.shortForecast}</div>
              <div className={`flex w-12 items-center gap-0.5 text-xs ${pop > 30 ? "text-primary" : "text-muted-foreground"}`}>
                <Droplets className="h-3 w-3" />
                {pop}%
              </div>
              <div className="flex w-20 justify-end gap-2 text-sm tabular-nums">
                <span className="font-semibold">{d.day?.temperature ?? "—"}°</span>
                <span className="text-muted-foreground">{d.night?.temperature ?? "—"}°</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}