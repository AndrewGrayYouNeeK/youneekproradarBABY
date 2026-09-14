import { describeWeatherCode } from "@/lib/weather/conditions";
import { frostCard, weatherIconClass } from "@/lib/weather/skyTheme";
import WindDial from "@/components/weather/WindDial";
import WeatherSourceBadge from "@/components/forecast/WeatherSourceBadge";

export default function NowHero({ data, source, weatherkitError, weatherkitConfigured }) {
  if (!data) return null;
  const current = data.current || {};
  const daily = data.daily || {};
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;

  return (
    <section className="px-1 pt-1">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-baseline gap-1 text-white drop-shadow">
            <span className="text-8xl font-extralight leading-none tabular-nums">
              {Math.round(current.temperature_2m ?? 0)}
            </span>
            <span className="text-2xl text-white/90">°</span>
          </div>
          <div className="mt-2 text-lg font-medium text-white drop-shadow">
            {current.condition_label || code.label}
          </div>
          <div className="mt-1 text-sm text-white/85">
            Feels Like {Math.round(current.apparent_temperature ?? 0)}°
          </div>
          <div className="mt-1 text-sm font-semibold text-white">
            Hi {Math.round(daily.temperature_2m_max?.[0] ?? 0)}° · Lo{" "}
            {Math.round(daily.temperature_2m_min?.[0] ?? 0)}°
          </div>
        </div>
        <div className="flex flex-col items-center pt-1">
          <Icon className={`h-20 w-20 ${weatherIconClass(current.weather_code)}`} strokeWidth={1.2} aria-hidden="true" />
        </div>
      </div>
      <div className="mt-5">
        <WindDial
          speedMph={current.wind_speed_10m}
          directionDeg={current.wind_direction_10m}
          gustMph={current.wind_gusts_10m}
        />
      </div>
      <div className={`mt-4 px-3 py-2 ${frostCard}`}>
        <WeatherSourceBadge
          source={source}
          weatherkitError={weatherkitError}
          weatherkitConfigured={weatherkitConfigured}
        />
      </div>
    </section>
  );
}
