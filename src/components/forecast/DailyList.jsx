import { describeWeatherCode, formatDayLabel } from "@/lib/weather/conditions";

export default function DailyList({ days = [] }) {
  if (!days.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        10-Day Outlook
      </h2>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5">
        {days.map((day, index) => {
          const code = describeWeatherCode(day.weather_code);
          const Icon = code.icon;
          return (
            <div
              key={day.date}
              className={`flex items-center gap-3 px-4 py-3 ${index > 0 ? "border-t border-white/5" : ""}`}
            >
              <div className="w-24 shrink-0 text-sm font-medium text-white">{formatDayLabel(day.date)}</div>
              <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs text-slate-400">{day.label || code.label}</div>
                {(day.snow > 0 || day.precip > 0.05) && (
                  <div className="text-[10px] text-slate-500">
                    {day.precip > 0.05 ? `${Number(day.precip).toFixed(2)}" rain` : ""}
                    {day.snow > 0 ? ` · ${Number(day.snow).toFixed(1)}" snow` : ""}
                  </div>
                )}
              </div>
              <div className="shrink-0 text-[11px] text-slate-500">{day.pop}%{day.uv != null ? ` · UV ${day.uv}` : ""}</div>
              <div className="flex shrink-0 items-center gap-2 text-sm tabular-nums">
                <span className="font-semibold text-white">{day.high}°</span>
                <span className="text-slate-500">{day.low}°</span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
