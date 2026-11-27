import AppDownloadLink from "@/components/landing/AppDownloadLink";
import CopyrightLine from "@/components/landing/CopyrightLine";
import RadarSweep from "@/components/landing/RadarSweep";
import { APP_ADDS_LINE, APP_COMING_SOON, MINIMAL_TAGLINE, appDownloadIsLive } from "@/lib/landing/launch";
import { RADAR_APP_URL } from "@/lib/landing/radarApp";

const primaryClass =
  "inline-flex min-h-12 w-full items-center justify-center bg-[#00ff9c] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto";
const secondaryClass =
  "inline-flex min-h-12 w-full items-center justify-center border border-[#00ff9c]/70 px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-[#00ff9c] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#00ff9c] sm:w-auto";
const linkClass = "inline-flex min-h-11 items-center text-[#00ff9c] underline-offset-4 hover:underline";

/** Bare-minimum landing: name, tagline, try the free web radar, what the app adds, get the app. */
export default function Landing() {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-black text-white">
      <main id="top" className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-10 text-center">
        <div className="w-44 sm:w-56">
          <RadarSweep />
        </div>
        <h1 className="mt-6 text-4xl font-black leading-none tracking-tight sm:text-5xl">
          YouNeeK Pro <span className="ynk-neon">Radar</span>
        </h1>
        <p className="mt-4 text-base text-white/85">{MINIMAL_TAGLINE}</p>

        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <a href={RADAR_APP_URL} className={secondaryClass}>
            Try the live radar
          </a>
          <AppDownloadLink className={primaryClass} />
        </div>
        {appDownloadIsLive() ? null : <p className="mt-3 text-xs text-white/60">{APP_COMING_SOON}</p>}

        <p className="mt-8 max-w-md text-sm leading-relaxed text-white/75">{APP_ADDS_LINE}</p>
      </main>

      <footer className="px-4 pb-8 text-center text-sm">
        <nav aria-label="Footer" className="flex items-center justify-center gap-x-3">
          <a className={linkClass} href="/privacy">
            Privacy
          </a>
          <span aria-hidden="true" className="text-white/40">
            ·
          </span>
          <a className={linkClass} href="/support">
            Support
          </a>
        </nav>
        <CopyrightLine className="mt-2" />
      </footer>
    </div>
  );
}
