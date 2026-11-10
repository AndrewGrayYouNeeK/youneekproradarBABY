import { ShieldAlert } from "lucide-react";
import { EXAMPLE_SMS, SAFETY_BODY, SAFETY_CLOSE, SAFETY_HEADING, SHELTER_REVIEW_NOTE } from "@/lib/landing/launch";

export default function SafetySms() {
  return (
    <section id="safety" className="scroll-mt-24 px-4 py-8 md:px-8" aria-labelledby="safety-heading">
      <div className="mx-auto max-w-6xl border border-[#ff4d6a]/70 bg-black/80 p-5 shadow-[0_0_40px_rgba(255,0,51,0.18)] backdrop-blur-md md:p-8">
        <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#ff8fa3]">
          <ShieldAlert className="h-4 w-4" aria-hidden="true" />
          I’m Sheltering
        </div>
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <h2 id="safety-heading" className="text-3xl font-bold leading-tight text-white md:text-4xl">
              {SAFETY_HEADING}
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-white/90 md:text-base">{SAFETY_BODY}</p>
            <p className="mt-4 text-sm font-semibold text-[#ffb4c0]">{SAFETY_CLOSE}</p>
            <p className="mt-4 max-w-xl text-xs leading-relaxed text-white/70">{SHELTER_REVIEW_NOTE}</p>
          </div>
          <div>
            <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-[#ffb4c0]">Example message. Not sent.</p>
            <div className="ml-auto max-w-sm rounded-2xl rounded-br-md border border-[#ff4d6a] bg-[#4a1020] px-4 py-3 text-white shadow-[0_0_24px_rgba(255,77,106,0.25)]">
              <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{EXAMPLE_SMS}</pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
