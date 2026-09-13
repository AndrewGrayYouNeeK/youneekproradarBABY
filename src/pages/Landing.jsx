import { Link } from "react-router-dom";
import { CloudSun, ChevronRight, ShieldCheck } from "lucide-react";
import { describeWeatherCode } from "@/lib/weather/conditions";
import { skyTheme, weatherIconClass, WEATHERBUG_GOLD } from "@/lib/weather/skyTheme";
import useForecastWeather from "@/hooks/useForecastWeather";
import useSiteConfig from "@/hooks/useSiteConfig";

function NowTeaser() {
  const { showLoading, data, locationError } = useForecastWeather();
  if (showLoading) {
    return (
      <div className="mb-8 w-full max-w-xs rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-sm text-white/80 backdrop-blur-md">
        Loading your conditions…
      </div>
    );
  }
  if (locationError || !data?.current?.current) return null;
  const current = data.current.current;
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;
  return (
    <div className="mb-8 flex w-full max-w-xs items-center gap-3 rounded-2xl border border-white/25 bg-white/15 px-4 py-3 text-left backdrop-blur-md">
      <Icon className={`h-10 w-10 shrink-0 ${weatherIconClass(current.weather_code)}`} strokeWidth={1.4} aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-3xl font-light tabular-nums text-white">
          {Math.round(current.temperature_2m ?? 0)}°F
        </div>
        <div className="text-xs text-white/80">{current.condition_label || code.label}</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { weatherHref, mapsHref, contactsHref, external } = useSiteConfig();
  const { data } = useForecastWeather();
  const current = data?.current?.current || {};
  const sky = skyTheme({
    weatherCode: current.weather_code,
    daylight: current.daylight !== false,
  });

  const primaryClass =
    "flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl text-base font-bold text-slate-950 shadow-lg";
  const secondaryClass =
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/25 bg-white/15 text-sm font-semibold text-white backdrop-blur-md";

  return (
    <div
      className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 text-center"
      style={{ background: sky.background }}
    >
      <div className="relative z-[1] flex max-w-md flex-col items-center">
        <div
          className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-white/30 bg-white/15 text-white shadow-lg backdrop-blur-xl"
          style={{ color: WEATHERBUG_GOLD }}
        >
          <CloudSun className="h-12 w-12" strokeWidth={1.6} />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-white/80">
          YouNeeK Pro Radar
        </p>
        <h1 className="mb-3 text-4xl font-black leading-tight text-white drop-shadow">
          Making It Rain Accuracy
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-white/85">
          Live conditions on this page. Open the weather app for NOW, Hourly, 10 Day, Maps, and NOAA radio.
        </p>

        <NowTeaser />

        {external ? (
          <a href={weatherHref} className={primaryClass} style={{ background: WEATHERBUG_GOLD }}>
            Open the weather app
            <ChevronRight className="h-5 w-5" />
          </a>
        ) : (
          <Link to={weatherHref} className={primaryClass} style={{ background: WEATHERBUG_GOLD }}>
            Open the weather app
            <ChevronRight className="h-5 w-5" />
          </Link>
        )}
        <div className="mt-4 flex w-full max-w-xs gap-2">
          {external ? (
            <>
              <a href={mapsHref} className={secondaryClass}>
                Maps
              </a>
              <a href={contactsHref} className={secondaryClass}>
                <ShieldCheck className="h-4 w-4" />
                I&apos;m Safe
              </a>
            </>
          ) : (
            <>
              <Link to={mapsHref} className={secondaryClass}>
                Maps
              </Link>
              <Link to={contactsHref} className={secondaryClass}>
                <ShieldCheck className="h-4 w-4" />
                I&apos;m Safe
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
