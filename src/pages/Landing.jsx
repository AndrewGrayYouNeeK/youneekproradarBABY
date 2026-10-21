import { lazy, Suspense } from "react";
import { ChevronRight } from "lucide-react";
import WeatherBackground from "@/components/weather/WeatherBackground";
import NeonSigns from "@/components/landing/NeonSigns";
import RadarSweep from "@/components/landing/RadarSweep";
import SafetySms from "@/components/landing/SafetySms";
import useVisitorWeather from "@/hooks/useVisitorWeather";
import { RADAR_APP_URL } from "@/lib/landing/radarApp";
import { describeWeatherCode } from "@/lib/weather/conditions";

const MapPreview = lazy(() => import("@/components/landing/MapPreview"));

const SOURCE_LABEL = {
  ynk222: "YouNeeK radar weather",
  "open-meteo": "Open-Meteo",
};

function OpenRadarLink({ className, children }) {
  return (
    <a href={RADAR_APP_URL} className={className}>
      {children}
    </a>
  );
}

export default function Landing() {
  const { place, current, sky, weatherSource, loading, usingFallback } = useVisitorWeather();
  const code = describeWeatherCode(current?.weather_code, sky.daylight !== false);
  const Icon = code.icon;
  const placeLabel = place?.label || (loading ? "Finding you…" : "Sky estimate");
  const sourceLabel = SOURCE_LABEL[weatherSource] || (usingFallback ? "Time of day" : "");

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-black font-mono text-white">
      <WeatherBackground theme={sky} className="weather-bg--fixed" />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-black/30 via-black/10 to-black/55" />

      <div className="relative z-10">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-white/10 bg-black/60 px-4 py-3 backdrop-blur-md">
          <a href="#top" className="ynk-neon text-[11px] font-bold tracking-[0.32em]">
            YOUNEEK
          </a>
          <OpenRadarLink className="inline-flex min-h-11 items-center bg-[#00ff9c] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.22em] text-black">
            Open Radar
          </OpenRadarLink>
        </header>

        <section id="top" className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-8 pt-10 md:px-8 md:pt-16 lg:grid-cols-2">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 border border-[#00ff9c]/40 bg-black/70 px-3 py-1.5">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#00ff9c] shadow-[0_0_8px_#00ff9c]" />
              <span className="text-[10px] uppercase tracking-[0.28em] text-[#00ff9c]">SYS_ONLINE</span>
            </div>

            <h1 className="text-[2.7rem] font-black leading-[0.88] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)] sm:text-6xl lg:text-7xl">
              <span className="block">YouNeeK</span>
              <span className="block">PRO</span>
              <span className="relative block">
                <span className="ynk-glitch ynk-glitch--magenta absolute inset-0" aria-hidden="true">
                  RADAR
                </span>
                <span className="ynk-glitch ynk-glitch--green absolute inset-0" aria-hidden="true">
                  RADAR
                </span>
                <span className="ynk-neon relative">RADAR</span>
              </span>
            </h1>

            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/75">
              Live radar, the sky outside your window, and safety texts that reach your people.
            </p>

            <div className="mt-6 flex max-w-md items-center gap-3 border border-white/15 bg-black/70 px-4 py-3 backdrop-blur-md">
              <Icon className="h-10 w-10 shrink-0 text-[#00ff9c]" strokeWidth={1.4} aria-hidden="true" />
              <div className="min-w-0">
                <div className="text-3xl font-light tabular-nums text-white">
                  {loading ? "…" : current ? `${Math.round(current.temperature_2m)}°` : "—"}
                </div>
                <div className="truncate text-xs text-white/75">
                  {loading ? "Reading the sky…" : current?.condition_label || code.label}
                  {" · "}
                  {placeLabel}
                  {sourceLabel ? ` · ${sourceLabel}` : ""}
                </div>
              </div>
            </div>

            <span className="relative mt-6 inline-flex w-full max-w-xs">
              <span className="absolute inset-0 -translate-x-1.5 -translate-y-1.5 bg-[#ff00d4]" aria-hidden="true" />
              <OpenRadarLink className="relative inline-flex min-h-14 w-full items-center justify-center gap-2 bg-[#00ff9c] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black">
                Open Radar
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </OpenRadarLink>
            </span>
          </div>

          <RadarSweep />
        </section>

        <SafetySms latitude={place?.latitude} longitude={place?.longitude} />

        <Suspense
          fallback={
            <div className="px-4 py-16 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#00ff9c]">
              Loading the map…
            </div>
          }
        >
          <MapPreview latitude={place?.latitude} longitude={place?.longitude} />
        </Suspense>

        <NeonSigns />

        <footer className="px-4 py-10 text-center text-[10px] uppercase tracking-[0.28em] text-white/45">
          <a href={RADAR_APP_URL} className="text-[#00ff9c]">
            Open Radar
          </a>
          <span className="mx-2">·</span>
          YouNeeK Pro Radar
        </footer>
      </div>
    </div>
  );
}
