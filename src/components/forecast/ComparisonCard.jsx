import { describeWeatherCode } from "@/lib/weather/conditions";
import { formatTemp } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";

export default function ComparisonCard({ comparison, currentTemp }) {
  if (!comparison) return null;
  const { units } = useUnits();
  const code = describeWeatherCode(comparison.weather_code);
  const Icon = code.icon;
  const delta = comparison.delta;
  const deltaLabel =
    delta == null ? "" : delta === 0 ? "Same as yesterday" : delta > 0 ? `${delta}° warmer than yesterday` : `${Math.abs(delta)}° cooler than yesterday`;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Vs yesterday
      </h2>
      <div className="mt-2 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-white">
            Now {formatTemp(currentTemp, units.temp)} · yesterday {formatTemp(comparison.temperature, units.temp)} {comparison.label || code.label}
          </p>
          {deltaLabel && <p className="mt-1 text-xs text-slate-400">{deltaLabel}</p>}
        </div>
        <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
      </div>
    </section>
  );
}
