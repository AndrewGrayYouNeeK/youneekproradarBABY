import { Link } from "react-router-dom";
import { Radar, ChevronRight, ShieldCheck } from "lucide-react";
import StormBackground from "@/components/weather/StormBackground";
import { describeWeatherCode } from "@/lib/weather/conditions";
import useForecastWeather from "@/hooks/useForecastWeather";
import useSiteConfig from "@/hooks/useSiteConfig";

function NowTeaser() {
  const { showLoading, data, locationError } = useForecastWeather();
  if (showLoading) {
    return (
      <div className="mb-8 w-full max-w-xs rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-400">
        Loading your conditions…
      </div>
    );
  }
  if (locationError || !data?.current?.current) return null;
  const current = data.current.current;
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;
  return (
    <div className="mb-8 flex w-full max-w-xs items-center gap-3 rounded-2xl border border-lime-400/20 bg-slate-950/70 px-4 py-3 text-left backdrop-blur-xl">
      <Icon className="h-10 w-10 shrink-0 text-lime-300" strokeWidth={1.4} aria-hidden="true" />
      <div className="min-w-0">
        <div className="text-3xl font-light tabular-nums text-white">
          {Math.round(current.temperature_2m ?? 0)}°F
        </div>
        <div className="text-xs text-slate-400">{current.condition_label || code.label}</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const { weatherHref, mapsHref, contactsHref, external } = useSiteConfig();

  const primaryClass =
    "flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-lime-400 text-base font-bold text-zinc-950 shadow-lg shadow-lime-500/20";
  const secondaryClass =
    "flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white";

  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 text-center">
      <StormBackground />

      <div className="relative z-[1] flex max-w-md flex-col items-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-lime-400/30 bg-slate-950/60 text-lime-400 shadow-lg shadow-lime-500/10 backdrop-blur-xl">
          <Radar className="h-12 w-12" strokeWidth={1.6} />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-lime-400/80">
          YouNeeK Pro Radar
        </p>
        <h1 className="mb-3 text-4xl font-black leading-tight text-white">
          Making It Rain Accuracy
        </h1>
        <p className="mb-6 text-sm leading-relaxed text-slate-300">
          Live conditions on this page. Open the weather app for NOW, Hourly, 10 Day, Maps, and NOAA radio.
        </p>

        <NowTeaser />

        {external ? (
          <a href={weatherHref} className={primaryClass}>
            Open the weather app
            <ChevronRight className="h-5 w-5" />
          </a>
        ) : (
          <Link to={weatherHref} className={primaryClass}>
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
