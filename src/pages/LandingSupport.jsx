import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SUPPORT_CONTACT, YOUNEEK_HOME_URL, supportHref } from "@/lib/landing/launch";

export default function LandingSupport() {
  useEffect(() => {
    const previous = document.title;
    document.title = "Support · YouNeeK Pro Radar";
    return () => {
      document.title = previous;
    };
  }, []);

  const contact = String(SUPPORT_CONTACT || "").trim();
  const href = supportHref();
  const contactIsLive = href.startsWith("mailto:") || href.startsWith("http");

  return (
    <div className="min-h-[100dvh] bg-black text-white">
      <header className="border-b border-white/10 px-4 py-4 md:px-8">
        <Link to="/" className="ynk-neon text-[11px] font-bold tracking-[0.32em]">
          YOUNEEK
        </Link>
      </header>
      <main className="mx-auto max-w-2xl px-4 py-10 md:px-8">
        <p className="font-mono text-[10px] font-bold uppercase tracking-[0.28em] text-[#ffb4c0]">
          Placeholder for Andrew
        </p>
        <h1 className="mt-3 text-4xl font-black">Support</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/80">
          This is the support URL for YouNeeK Pro Radar. The contact below comes from one config constant. Nothing is published until that constant is set.
        </p>

        {contactIsLive ? (
          <p className="mt-8 text-base">
            <a className="text-[#00ff9c] underline-offset-4 hover:underline" href={href}>
              {contact}
            </a>
          </p>
        ) : (
          <div className="mt-8 border border-[#ffb4c0]/60 bg-[#2a0a12] p-4" role="note">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-[#ffb4c0]">
              Contact not set
            </p>
            <p className="mt-2 text-sm leading-relaxed text-white/90">
              No support email or URL is published yet. Set SUPPORT_CONTACT in src/lib/landing/launch.js before App Store submission.
            </p>
          </div>
        )}

        <p className="mt-8 text-sm">
          <Link to="/" className="text-[#00ff9c] underline-offset-4 hover:underline">
            Back to YouNeeK Pro Radar
          </Link>
          <span className="mx-2 text-white/40" aria-hidden="true">
            ·
          </span>
          <Link to="/privacy" className="text-[#00ff9c] underline-offset-4 hover:underline">
            Privacy Policy
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
