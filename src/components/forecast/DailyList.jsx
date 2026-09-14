import { describeWeatherCode, formatDayLabel, formatPrecipType } from "@/lib/weather/conditions";
import { formatMoonPhase } from "@/lib/weather/lifestyle";
import { formatPrecip, formatTemp, formatWind } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";

export default function DailyList({ days = [] }) {
  const { units } = useUnits();
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
          const precipType = formatPrecipType(day.precipType);
          const nightLabel = day.overnight?.label;
          return (
            <div
              key={day.date}
              className={`px-4 py-3 ${index > 0 ? "border-t border-white/5" : ""}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-24 shrink-0 text-sm font-medium text-white">{formatDayLabel(day.date)}</div>
                <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs text-slate-400">{day.label || code.label}</div>
                  {nightLabel && nightLabel !== day.label && (
                    <div className="truncate text-[10px] text-slate-500">Tonight {nightLabel}</div>
                  )}
                  {(day.snow > 0.05 || day.precip > 0.05 || precipType) && (
                    <div className="text-[10px] text-slate-500">
                      {precipType ? `${precipType}` : ""}
                      {day.precip > 0.05 ? `${precipType ? " · " : ""}${formatPrecip(day.precip, units.precip)} rain` : ""}
                      {day.snow > 0.05 ? ` · ${formatPrecip(day.snow, units.precip)} snow` : ""}
                    </div>
                  )}
                  {(day.windMax != null || day.gusts != null) && (
                    <div className="text-[10px] text-slate-600">
                      Wind {formatWind(day.windMax ?? day.windAvg, units.wind)}
                      {day.gusts != null ? ` · gusts ${formatWind(day.gusts, units.wind)}` : ""}
                    </div>
                  )}
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-[11px] text-slate-500">{day.pop}%{day.uv != null ? ` · UV ${day.uv}` : ""}</div>
                  {day.moonPhase && (
                    <div className="text-[10px] text-slate-600">{formatMoonPhase(day.moonPhase)}</div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-2 text-sm tabular-nums">
                  <span className="font-semibold text-white">{formatTemp(day.high, units.temp)}</span>
                  <span className="text-slate-500">{formatTemp(day.low, units.temp)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
