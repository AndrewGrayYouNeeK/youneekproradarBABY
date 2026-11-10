import AppDownloadLink from "@/components/landing/AppDownloadLink";
import { ONE_TIME_PRICE, appDownloadIsLive, oneTimePriceLabel } from "@/lib/landing/launch";

export default function PricingBlock() {
  const price = oneTimePriceLabel(ONE_TIME_PRICE);
  return (
    <section id="waitlist" className="scroll-mt-24 px-4 py-12 md:px-8" aria-labelledby="pricing-heading">
      <div className="mx-auto max-w-3xl border border-[#00ff9c]/40 bg-black/80 p-6 backdrop-blur-md md:p-8">
        <h2 id="pricing-heading" className="text-3xl font-black text-white">
          One-time purchase.
        </h2>
        <p className="mt-3 text-base leading-relaxed text-white/85">No subscriptions. No ads. No upsells later.</p>
        <p className="mt-2 text-base leading-relaxed text-white/85">Get YouNeeK Pro Radar and own it.</p>
        <p className="mt-5 font-mono text-[11px] uppercase tracking-[0.22em] text-[#00ff9c]">One-time price</p>
        {price ? (
          <p className="mt-2 text-4xl font-black tabular-nums text-white">{price}</p>
        ) : (
          <p className="mt-2 text-sm text-white/70">The price will appear here once it is set. No number is shown until then.</p>
        )}
        <AppDownloadLink className="mt-6 inline-flex min-h-12 items-center justify-center bg-[#00ff9c] px-5 py-3 text-xs font-bold uppercase tracking-[0.2em] text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" />
        {!appDownloadIsLive() ? (
          <p className="mt-3 text-sm text-white/75">
            The TestFlight and App Store link is not set yet. This button stays on the page until that URL exists.
          </p>
        ) : null}
      </div>
    </section>
  );
}
