import { useEffect } from "react";
import { Link } from "react-router-dom";
import AppDownloadLink from "@/components/landing/AppDownloadLink";
import CopyrightLine from "@/components/landing/CopyrightLine";
import { RADAR_APP_URL } from "@/lib/landing/radarApp";

/** Every former web-app page on youneekproradar.com. The features are in the paid app. */
export default function LandingLocked() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Premium in the app · YouNeeK Pro Radar";
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-black px-5 text-center text-white" data-premium-locked="web">
      <p className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-[#00ff9c]">Premium in the app</p>
      <h1 className="mt-3 text-3xl font-black">This is in the YouNeeK Pro Radar app</h1>
      <p className="mt-3 max-w-sm text-sm text-white/75">
        The website is a free preview with live radar and tornado and severe warnings. Everything else comes with the $6.99 app.
      </p>
      <div className="mt-6 flex w-full max-w-sm flex-col gap-3">
        <a
          href={RADAR_APP_URL}
          className="inline-flex min-h-12 items-center justify-center border border-[#00ff9c]/70 px-5 text-xs font-bold uppercase tracking-[0.2em] text-[#00ff9c]"
        >
          Try the live radar
        </a>
        <AppDownloadLink className="inline-flex min-h-12 items-center justify-center bg-[#00ff9c] px-5 text-xs font-bold uppercase tracking-[0.2em] text-black" />
      </div>
      <Link to="/" className="mt-6 text-sm text-[#00ff9c] underline-offset-4 hover:underline">
        Back to YouNeeK Pro Radar
      </Link>
      <footer className="mt-10">
        <CopyrightLine />
      </footer>
    </div>
  );
}
