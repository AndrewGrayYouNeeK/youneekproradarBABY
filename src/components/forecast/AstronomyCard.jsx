import { Moon, Sun } from "lucide-react";
import { formatClock } from "@/lib/weather/conditions";

export default function AstronomyCard({ astronomy }) {
  if (!astronomy?.sunrise && !astronomy?.moonPhaseLabel) return null;

  const sunRows = [
    ["Astronomical", astronomy.sunriseAstronomical, astronomy.sunsetAstronomical],
    ["Nautical", astronomy.sunriseNautical, astronomy.sunsetNautical],
    ["Civil", astronomy.sunriseCivil, astronomy.sunsetCivil],
    ["Sunrise / sunset", astronomy.sunrise, astronomy.sunset],
  ].filter(([, rise, set]) => rise || set);

  return (
    <section className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Sun & moon</h2>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Sun className="h-4 w-4 text-amber-300" aria-hidden="true" />
            Solar
          </div>
          <div className="mt-2 space-y-1.5 text-xs text-slate-300">
            {sunRows.map(([label, rise, set]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-slate-500">{label}</span>
                <span className="tabular-nums">{formatClock(rise)} – {formatClock(set)}</span>
              </div>
            ))}
            {astronomy.solarNoon && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Solar noon</span>
                <span className="tabular-nums">{formatClock(astronomy.solarNoon)}</span>
              </div>
            )}
            {astronomy.solarMidnight && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-slate-500">Solar midnight</span>
                <span className="tabular-nums">{formatClock(astronomy.solarMidnight)}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-white">
            <Moon className="h-4 w-4 text-sky-300" aria-hidden="true" />
            Lunar
          </div>
          <div className="mt-2 space-y-1.5 text-xs text-slate-300">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Phase</span>
              <span>{astronomy.moonPhaseLabel || "—"}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Moonrise</span>
              <span className="tabular-nums">{formatClock(astronomy.moonrise)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Moonset</span>
              <span className="tabular-nums">{formatClock(astronomy.moonset)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
