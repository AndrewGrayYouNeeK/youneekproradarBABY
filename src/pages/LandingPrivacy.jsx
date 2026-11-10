import { Link } from "react-router-dom";
import { YOUNEEK_HOME_URL } from "@/lib/landing/launch";

export default function LandingPrivacy() {
  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <header className="border-b border-white/10 px-4 py-4 md:px-8">
        <Link to="/" className="ynk-neon text-[11px] font-bold tracking-[0.32em]">
          YOUNEEK
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffb4c0]">
          Draft for Andrew’s review
        </p>
        <h1 className="mt-3 text-4xl font-black">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/80">
          This draft is for the YouNeeK Pro Radar iOS app and for this website. Review it before using the URL in App Store Connect.
        </p>

        <h2 className="mt-8 text-xl font-bold">The iOS app</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/85">
          <p>Location is used to show radar and alerts, and to put your coordinates in the emergency shelter text.</p>
          <p>
            Safety contacts stay on your phone. The app does not upload your contact list and does not require an account.
          </p>
          <p>
            “I’m Sheltering” opens a message in the iOS Messages composer. You review the text and tap Send. Nothing is sent until you do.
          </p>
          <p>The app is ad-free. It does not use advertising identifiers and it does not track you across other companies’ apps or websites.</p>
        </div>

        <h2 className="mt-8 text-xl font-bold">This website</h2>
        <div className="mt-3 space-y-3 text-sm leading-relaxed text-white/85">
          <p>
            youneekproradar.com can show a basic briefing: active warnings, current conditions, a short forecast, and a simple radar loop.
            If you allow location, that briefing uses it. If you do not, the page may use an approximate location from your network, or a city you search.
            No sample city is shown when neither is available.
          </p>
          <p>
            Those coordinates are sent to the National Weather Service, Open-Meteo, and Iowa Environmental Mesonet so the page can fetch alerts, the forecast, and radar tiles.
            An IP geolocation service may be used only to estimate a starting point. This site does not store your location on our servers, does not sell it, and does not create an account for you.
          </p>
          <p>This website does not show ads and does not include third-party tracking pixels.</p>
        </div>

        <h2 className="mt-8 text-xl font-bold">Before you publish</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/85">
          The separate web radar app also talks to Apple WeatherKit and RainViewer. If the iOS build does too, name those providers here before submission.
          The support address on this site is still a placeholder.
        </p>
        <p className="mt-6 text-sm">
          <Link to="/" className="text-[#00ff9c] underline-offset-4 hover:underline">
            Back to YouNeeK Pro Radar
          </Link>
          <span className="mx-2 text-white/40" aria-hidden="true">
            ·
          </span>
          <Link to="/support" className="text-[#00ff9c] underline-offset-4 hover:underline">
            Support
          </Link>
          <span className="mx-2 text-white/40" aria-hidden="true">
            ·
          </span>
          <a href={YOUNEEK_HOME_URL} className="text-[#00ff9c] underline-offset-4 hover:underline">
            youneek.dev
          </a>
        </p>
      </main>
    </div>
  );
}
