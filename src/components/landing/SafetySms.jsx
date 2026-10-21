import { MessageSquare, ShieldAlert } from "lucide-react";
import { RADAR_APP_URL, RADAR_SAFETY_URL } from "@/lib/landing/radarApp";
import { buildEmergencyBody } from "@/lib/safety/sms";

export default function SafetySms({ latitude, longitude }) {
  const locationLine =
    Number.isFinite(latitude) && Number.isFinite(longitude)
      ? `My location: https://maps.google.com/?q=${latitude},${longitude}`
      : "My location: added when GPS is on.";
  const preview = buildEmergencyBody({ locationLine });

  return (
    <section id="safety" className="scroll-mt-24 px-4 py-8 md:px-8">
      <div className="mx-auto max-w-6xl border border-[#ff4d6a]/50 bg-black/80 p-5 shadow-[0_0_40px_rgba(255,0,51,0.18)] backdrop-blur-md md:p-8">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#ff4d6a]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          Safety text messages
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-bold leading-tight text-white md:text-4xl">
              One tap texts the people who need to know you are safe.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/75 md:text-base">
              Help Me and I&apos;m Safe are built into the radar app. Each text goes to your shelter contacts with a GPS pin and a Google Maps link. You still tap Send.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a
                href={RADAR_SAFETY_URL}
                className="inline-flex min-h-12 items-center justify-center gap-2 bg-[#ff4d6a] px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white"
              >
                <MessageSquare className="h-4 w-4" aria-hidden="true" />
                Open safety texts
              </a>
              <a
                href={RADAR_APP_URL}
                className="inline-flex min-h-12 items-center justify-center border border-white/30 px-5 py-3 text-xs font-bold uppercase tracking-[0.22em] text-white"
              >
                Open Radar
              </a>
            </div>
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap border border-white/15 bg-black px-4 py-3 font-mono text-xs leading-relaxed text-[#00ff9c]">
            {preview}
          </pre>
        </div>
      </div>
    </section>
  );
}
