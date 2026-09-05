import { describeWeatherCode } from "@/lib/weather/conditions";
import WindDial from "@/components/weather/WindDial";

export default function NowHero({ data }) {
  if (!data) return null;
  const current = data.current || {};
  const daily = data.daily || {};
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-7xl font-extralight leading-none tabular-nums text-white">
              {Math.round(current.temperature_2m ?? 0)}
            </span>
            <span className="text-2xl text-slate-300">°F</span>
          </div>
          <div className="mt-2 text-sm text-slate-300">
            Feels Like: {Math.round(current.apparent_temperature ?? 0)}°
          </div>
          <div className="mt-1 text-sm text-slate-400">
            Hi: {Math.round(daily.temperature_2m_max?.[0] ?? 0)}° | Lo: {Math.round(daily.temperature_2m_min?.[0] ?? 0)}°
          </div>
        </div>
        <div className="flex flex-col items-center pt-1">
          <Icon className="h-16 w-16 text-lime-300" strokeWidth={1.3} aria-hidden="true" />
          <div className="mt-1 max-w-[7.5rem] text-center text-sm font-medium text-white">
            {current.condition_label || code.label}
          </div>
        </div>
      </div>
      <div className="mt-5">
        <WindDial
          speedMph={current.wind_speed_10m}
          directionDeg={current.wind_direction_10m}
          gustMph={current.wind_gusts_10m}
        />
      </div>
    </section>
  );
}
