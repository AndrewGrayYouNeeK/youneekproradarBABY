import { Link } from "react-router-dom";
import { Radar, ChevronRight, ShieldCheck } from "lucide-react";
import StormBackground from "@/components/weather/StormBackground";

export default function Landing() {
  return (
    <div className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-slate-950 px-6 text-center">
      <StormBackground />

      <div className="relative z-[1] flex max-w-md flex-col items-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-lime-400/30 bg-slate-950/60 text-lime-400 shadow-lg shadow-lime-500/10 backdrop-blur-xl">
          <Radar className="h-12 w-12" strokeWidth={1.6} />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-lime-400/80">
          YouNeeK Pro Radar
        </p>
        <h1 className="mb-3 text-4xl font-black leading-tight text-white">
          Making It Rain Accuracy
        </h1>
        <p className="mb-8 text-sm leading-relaxed text-slate-300">
          Live radar, hour-by-hour forecasts, NOAA radio, and one-tap Help Me / I&apos;m Safe texts — storm-ready without the clutter.
        </p>

        <Link
          to="/Forecast"
          className="flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-lime-400 text-base font-bold text-zinc-950 shadow-lg shadow-lime-500/20"
        >
          Open the app
          <ChevronRight className="h-5 w-5" />
        </Link>
        <div className="mt-4 flex w-full max-w-xs gap-2">
          <Link
            to="/Radar"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white"
          >
            Maps
          </Link>
          <Link
            to="/Contacts"
            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 text-sm font-semibold text-white"
          >
            <ShieldCheck className="h-4 w-4" />
            I&apos;m Safe
          </Link>
        </div>
      </div>
    </div>
  );
}
