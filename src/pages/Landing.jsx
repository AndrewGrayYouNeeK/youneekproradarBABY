import { Link } from "react-router-dom";
import { Radar, ChevronRight } from "lucide-react";
import StormBackground from "@/components/weather/StormBackground";

export default function Landing() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center safe-screen">
      <StormBackground />

      <div className="relative z-[1] flex max-w-md flex-col items-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl border border-cyan-400/30 bg-slate-950/60 text-cyan-400 shadow-lg shadow-cyan-500/10 backdrop-blur-xl">
          <Radar className="h-12 w-12" strokeWidth={1.6} />
        </div>

        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-cyan-400/80">
          YouNeeK Pro Radar
        </p>
        <h1 className="mb-4 text-4xl font-black leading-tight text-white">
          See the storm before it hits
        </h1>
        <p className="mb-10 text-sm leading-relaxed text-slate-300">
          Live NEXRAD radar, NOAA alerts, and weather radio — built for storm-aware people.
        </p>

        <Link
          to="/Radar"
          className="flex h-14 w-full max-w-xs items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:bg-primary/90"
        >
          Open Radar
          <ChevronRight className="h-5 w-5" />
        </Link>
      </div>
    </div>
  );
}
