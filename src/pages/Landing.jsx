import { lazy, Suspense } from "react";
import { ChevronRight } from "lucide-react";
import AlertBanner from "@/components/landing/AlertBanner";
import NeonSigns from "@/components/landing/NeonSigns";
import RadarSweep from "@/components/landing/RadarSweep";
import SafetySms from "@/components/landing/SafetySms";
import WeatherDesk from "@/components/landing/WeatherDesk";
import WeatherBackground from "@/components/weather/WeatherBackground";
import useVisitorWeather from "@/hooks/useVisitorWeather";
import { RADAR_APP_URL } from "@/lib/landing/radarApp";

const MapPreview = lazy(() => import("@/components/landing/MapPreview"));

function OpenRadarLink({ className, children }) {
  return (
    <a href={RADAR_APP_URL} className={className}>
      {children}
    </a>
  );
}

export default function Landing() {
  const weather = useVisitorWeather();
  const alertState = weather.place ? weather.alertsState : weather.loading ? "loading" : "idle";

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-black font-mono text-white">
      <WeatherBackground theme={weather.sky} className="weather-bg--fixed" />
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

        <main id="top" className="mx-auto grid max-w-6xl gap-8 px-4 pb-6 pt-4 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
          <div>
            <div className="mb-4">
              {alertState === "idle" ? (
                <div className="border border-white/20 bg-black/70 px-4 py-3 text-sm text-white/80">
                  Search a city or allow location to check NWS alerts.
                </div>
              ) : (
                <AlertBanner alerts={weather.alerts} state={alertState} />
              )}
            </div>

            <WeatherDesk
              placeLabel={weather.placeLabel}
              current={weather.current}
              hourly={weather.hourly}
              daily={weather.daily}
              loading={weather.loading}
              forecastError={weather.forecastError}
              onRetry={weather.refetchForecast}
              daylight={weather.sky.daylight}
              locationNote={weather.locationNote}
              onSelectPlace={weather.choosePlace}
              onUseMine={weather.useMyLocation}
            />

            <h1 className="mt-6 text-[2rem] font-black leading-[0.9] tracking-tight text-white drop-shadow-[0_2px_16px_rgba(0,0,0,0.75)] sm:text-5xl">
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

            <span className="relative mt-6 inline-flex w-full max-w-xs">
              <span className="absolute inset-0 -translate-x-1.5 -translate-y-1.5 bg-[#ff00d4]" aria-hidden="true" />
              <OpenRadarLink className="relative inline-flex min-h-14 w-full items-center justify-center gap-2 bg-[#00ff9c] px-6 py-3.5 text-xs font-bold uppercase tracking-[0.25em] text-black">
                Open Radar
                <ChevronRight className="h-4 w-4" aria-hidden="true" />
              </OpenRadarLink>
            </span>
          </div>

          <div className="hidden lg:block">
            <RadarSweep />
          </div>
        </main>

        <SafetySms latitude={weather.place?.latitude} longitude={weather.place?.longitude} />

        <Suspense
          fallback={
            <div className="px-4 py-16 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-[#00ff9c]">
              Loading the map…
            </div>
          }
        >
          <MapPreview
            latitude={weather.place?.latitude}
            longitude={weather.place?.longitude}
            alerts={weather.outlines.length ? weather.outlines : weather.alerts}
          />
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
