import { describeWeatherCode, degToCardinal, formatHourTime, formatPrecipType } from "@/lib/weather/conditions";
import { formatPrecip, formatTemp, formatWind } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";

export default function HourlyStrip({ hours = [], title }) {
  const { units } = useUnits();
  if (!hours.length) return null;

  let lastDay = "";

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        {title || `Hourly · ${hours.length} hours`}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hours.map((hour) => {
          const code = describeWeatherCode(hour.weather_code);
          const Icon = code.icon;
          const day = new Date(hour.time).toLocaleDateString([], { weekday: "short" });
          const showDay = day !== lastDay;
          lastDay = day;
          const precipType = formatPrecipType(hour.precipType);
          return (
            <div
              key={hour.time}
              className="min-w-[5.25rem] rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-center"
            >
              <div className="text-[10px] uppercase tracking-wide text-cyan-300/80">{showDay ? day : "\u00a0"}</div>
              <div className="text-[11px] text-slate-400">{formatHourTime(hour.time)}</div>
              <Icon className="mx-auto my-2 h-5 w-5 text-sky-300" aria-hidden="true" />
              <div className="text-sm font-semibold text-white">{formatTemp(hour.temperature, units.temp)}</div>
              <div className="mt-1 text-[10px] text-slate-500">
                {precipType || `${hour.pop}%`}
              </div>
              {hour.gusts != null && (
                <div className="mt-1 text-[10px] text-slate-500">G {formatWind(hour.gusts, units.wind)}</div>
              )}
              {hour.wind != null && hour.windDir != null && (
                <div className="text-[10px] text-slate-600">{degToCardinal(hour.windDir)}</div>
              )}
              {Number(hour.snow) > 0.05 && (
                <div className="text-[10px] text-sky-300">{formatPrecip(hour.snow, units.precip)} snow</div>
              )}
              {hour.uv != null && hour.uv > 0 && (
                <div className="text-[10px] text-slate-600">UV {hour.uv}</div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
