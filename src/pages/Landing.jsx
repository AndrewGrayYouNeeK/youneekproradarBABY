import { lazy, Suspense } from "react";
import { ChevronRight } from "lucide-react";
import AlertBanner from "@/components/landing/AlertBanner";
import AppDownloadLink from "@/components/landing/AppDownloadLink";
import FeatureCards from "@/components/landing/FeatureCards";
import HowItWorks from "@/components/landing/HowItWorks";
import NeonSigns from "@/components/landing/NeonSigns";
import PhoneFrame from "@/components/landing/PhoneFrame";
import PricingBlock from "@/components/landing/PricingBlock";
import RadarSweep from "@/components/landing/RadarSweep";
import SafetySms from "@/components/landing/SafetySms";
import WeatherDesk from "@/components/landing/WeatherDesk";
import WeatherBackground from "@/components/weather/WeatherBackground";
import useVisitorWeather from "@/hooks/useVisitorWeather";
import {
  HEADLINE,
  PURCHASE_LINE,
  SUBHEAD,
  TITLE_LINE,
  YOUNEEK_HOME_URL,
  appDownloadIsLive,
} from "@/lib/landing/launch";
import { RADAR_APP_URL } from "@/lib/landing/radarApp";

const MapPreview = lazy(() => import("@/components/landing/MapPreview"));

const primaryClass =
  "inline-flex min-h-12 items-center justify-center bg-[#00ff9c] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
const secondaryClass =
  "inline-flex min-h-12 items-center justify-center border border-white/40 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00ff9c]";

export default function Landing() {
  const weather = useVisitorWeather();
  const alertState = weather.place ? weather.alertsState : weather.loading ? "loading" : "idle";
  const storeLive = appDownloadIsLive();

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-black text-white">
      <WeatherBackground theme={weather.sky} className="weather-bg--fixed" />
      <div className="pointer-events-none fixed inset-0 z-[1] bg-gradient-to-b from-black/62 via-black/48 to-black/72" />

      <div className="relative z-10">
        <a
          href="#top"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-black focus:px-3 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>

        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-black/75 px-4 py-3 backdrop-blur-md">
          <a href="#top" className="ynk-neon text-[11px] font-bold tracking-[0.32em]">
            YOUNEEK
          </a>
          <div className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
            <a
              href={RADAR_APP_URL}
              className="inline-flex min-h-11 items-center text-sm font-semibold text-[#00ff9c] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00ff9c]"
            >
              Open web radar →
            </a>
            <AppDownloadLink className={primaryClass} />
          </div>
        </header>

        <main id="top">
          <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pb-6 pt-8 md:grid-cols-[minmax(0,1.1fr)_minmax(260px,0.9fr)] md:px-8">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.35em] text-[#00ff9c]">YouNeeK Pro Radar</p>
              <h1 className="mt-3 text-4xl font-black leading-[1.05] text-white sm:text-5xl">{HEADLINE}</h1>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/90">{SUBHEAD}</p>
              <p className="mt-3 text-sm font-semibold tracking-wide text-white">{PURCHASE_LINE}</p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <AppDownloadLink className={primaryClass} />
                <a href={RADAR_APP_URL} className={secondaryClass}>
                  Open Radar
                </a>
              </div>
              {storeLive ? null : (
                <p className="mt-3 max-w-md text-sm text-white/75">
                  Join TestFlight stays on this page until a TestFlight or App Store link is added.
                </p>
              )}
            </div>
            <PhoneFrame
              title="Radar"
              caption="Stylized radar preview. Replace with a screenshot from a real phone."
            >
              <RadarSweep />
            </PhoneFrame>
          </section>

          <section id="conditions" className="scroll-mt-24 mx-auto max-w-6xl px-4 py-8 md:px-8" aria-labelledby="conditions-heading">
            <h2 id="conditions-heading" className="text-2xl font-bold text-white">
              Current conditions
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/75">
              Active warnings, the sky right now, and a short forecast. Lightning and other pro layers stay in the app.
            </p>
            <div className="mt-4">
              {alertState === "idle" ? (
                <div className="border border-white/20 bg-black/70 px-4 py-3 text-sm text-white/85">
                  Allow location or search a city to check National Weather Service alerts. No sample city is loaded.
                </div>
              ) : (
                <AlertBanner alerts={weather.alerts} state={alertState} />
              )}
            </div>
            <WeatherDesk
              placeLabel={weather.placeLabel}
              placeSource={weather.place?.source || ""}
              hasPlace={Boolean(weather.place)}
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
          </section>

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

          <section className="px-4 py-12 md:px-8" aria-labelledby="title-heading">
            <div className="mx-auto max-w-6xl">
              <h2 id="title-heading" className="text-[2.4rem] font-black leading-[0.9] tracking-tight text-white sm:text-6xl">
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
              </h2>
              <p className="mt-4 max-w-xl text-lg text-white/90">{TITLE_LINE}</p>
              <span className="relative mt-6 inline-flex w-full max-w-xs">
                <span className="absolute inset-0 -translate-x-1.5 -translate-y-1.5 bg-[#ff00d4]" aria-hidden="true" />
                <AppDownloadLink className={`${primaryClass} relative w-full gap-2`}>
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </AppDownloadLink>
              </span>
            </div>
          </section>

          <FeatureCards />
          <SafetySms />
          <HowItWorks />
          <PricingBlock />
          <NeonSigns />

          <footer className="px-4 py-12 text-center md:px-8">
            <p className="text-sm font-semibold tracking-wide text-white">YouNeeK Pro Radar</p>
            <nav aria-label="Footer" className="mt-4 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-sm">
              <a className="inline-flex min-h-11 items-center text-[#00ff9c] underline-offset-4 hover:underline" href="/privacy">
                Privacy Policy
              </a>
              <span aria-hidden="true" className="text-white/40">
                ·
              </span>
              <a className="inline-flex min-h-11 items-center text-[#00ff9c] underline-offset-4 hover:underline" href="/support">
                Support
              </a>
              <span aria-hidden="true" className="text-white/40">
                ·
              </span>
              <a
                className="inline-flex min-h-11 items-center text-[#00ff9c] underline-offset-4 hover:underline"
                href={YOUNEEK_HOME_URL}
              >
                youneek.dev
              </a>
            </nav>
            <p className="mt-6 text-sm text-white/75">
              Also on the web{" "}
              <a className="text-[#00ff9c] underline-offset-4 hover:underline" href={RADAR_APP_URL}>
                Open web radar
              </a>
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
