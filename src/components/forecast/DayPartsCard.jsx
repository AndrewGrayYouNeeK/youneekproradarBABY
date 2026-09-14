import { describeWeatherCode, degToCardinal, formatPrecipType } from "@/lib/weather/conditions";
import { formatPrecip, formatTemp, formatWind } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";

export default function DayPartsCard({ parts = [] }) {
  if (!parts.length) return null;
  const unique = [];
  const seen = new Set();
  parts.forEach((part) => {
    const key = `${part.title}-${part.start}-${part.conditionCode}`;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(part);
  });

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        Today / tonight
      </h2>
      <div className="grid gap-2 sm:grid-cols-3">
        {unique.map((part) => (
          <DayPart key={part.id || part.title} part={part} />
        ))}
      </div>
    </section>
  );
}

function DayPart({ part }) {
  const { units } = useUnits();
  const code = describeWeatherCode(part.weather_code);
  const Icon = code.icon;
  const precipType = formatPrecipType(part.precipType);

  return (
    <article className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{part.title}</div>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-white">{part.label || code.label}</div>
          <div className="mt-1 text-xs text-slate-400">
            {formatTemp(part.high, units.temp)} / {formatTemp(part.low, units.temp)}
          </div>
        </div>
        <Icon className="h-5 w-5 shrink-0 text-sky-300" aria-hidden="true" />
      </div>
      <div className="mt-3 space-y-1 text-[11px] text-slate-400">
        <div>{part.pop}% chance{precipType ? ` · ${precipType}` : ""}</div>
        {Number(part.precip) > 0.01 && <div>{formatPrecip(part.precip, units.precip)} liquid</div>}
        {Number(part.snow) > 0.05 && <div>{formatPrecip(part.snow, units.precip)} snow</div>}
        {part.wind != null && (
          <div>
            Wind {formatWind(part.wind, units.wind)} {degToCardinal(part.windDir)}
            {part.gusts != null ? ` · gusts ${formatWind(part.gusts, units.wind)}` : ""}
          </div>
        )}
        {part.humidity != null && <div>Humidity {part.humidity}%</div>}
        {part.cloudCover != null && <div>Clouds {part.cloudCover}%</div>}
      </div>
    </article>
  );
}
