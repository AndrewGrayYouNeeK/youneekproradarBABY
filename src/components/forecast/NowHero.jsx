import { describeWeatherCode } from "@/lib/weather/conditions";
import WindDial from "@/components/weather/WindDial";
import WeatherSourceBadge from "@/components/forecast/WeatherSourceBadge";

export default function NowHero({ data, source, weatherkitError, weatherkitConfigured }) {
  if (!data) return null;
  const current = data.current || {};
  const daily = data.daily || {};
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;
  const daylight = current.daylight !== false;

  return (
    <section
      className="overflow-hidden rounded-3xl border border-white/10 p-5"
      style={{
        background: daylight
          ? "linear-gradient(180deg, rgba(56,189,248,0.22) 0%, rgba(7,16,28,0.4) 55%, rgba(7,16,28,0.85) 100%)"
          : "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(7,16,28,0.9) 100%)",
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-8xl font-extralight leading-none tabular-nums text-white">
              {Math.round(current.temperature_2m ?? 0)}
            </span>
            <span className="text-2xl text-slate-300">°F</span>
          </div>
          <div className="mt-2 text-sm text-slate-300">
            Feels Like {Math.round(current.apparent_temperature ?? 0)}°
          </div>
          <div className="mt-1 text-sm text-slate-400">
            Hi {Math.round(daily.temperature_2m_max?.[0] ?? 0)}° · Lo {Math.round(daily.temperature_2m_min?.[0] ?? 0)}°
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
      <div className="mt-4">
        <WeatherSourceBadge
          source={source}
          weatherkitError={weatherkitError}
          weatherkitConfigured={weatherkitConfigured}
        />
      </div>
    </section>
  );
}
