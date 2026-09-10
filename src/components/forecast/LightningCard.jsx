import { kmToUserDistance } from "@/lib/geo";
import { Zap } from "lucide-react";

export default function LightningCard({ nearestKm, reportCount }) {
  const severe = nearestKm != null && nearestKm <= 16;
  const caution = nearestKm != null && nearestKm <= 40;

  return (
    <section className={`rounded-2xl border px-4 py-3 ${severe ? "border-yellow-400/40 bg-yellow-950/40" : caution ? "border-amber-400/25 bg-amber-950/30" : "border-white/10 bg-white/5"}`}>
      <div className="flex items-start gap-3">
        <Zap className={`mt-0.5 h-5 w-5 ${severe ? "text-yellow-300" : "text-slate-400"}`} aria-hidden="true" />
        <div>
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Lightning nearby</h2>
          <p className="mt-1 text-sm text-white">
            {nearestKm == null
              ? "No recent strikes reported nearby"
              : `Nearest activity ${kmToUserDistance(nearestKm)} away`}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {severe
              ? "Take shelter. Lightning is within a few miles."
              : caution
                ? "Be ready to head indoors. Storms are in range."
                : `${reportCount || 0} reports in the latest lightning feed.`}
          </p>
        </div>
      </div>
    </section>
  );
}
