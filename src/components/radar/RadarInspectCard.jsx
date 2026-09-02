import { Clock, Compass, MapPin, Navigation, X } from "lucide-react";

const CARDINAL_DIRS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function bearingToCardinal(deg) {
  return CARDINAL_DIRS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="min-w-0">
      <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
        <Icon className="h-3 w-3 text-lime-400" aria-hidden="true" />
        {label}
      </div>
      <div className="mt-0.5 truncate text-sm font-semibold text-white">{value}</div>
    </div>
  );
}

export default function RadarInspectCard({ inspector, stormData, onClose }) {
  if (!inspector?.active && !stormData) return null;

  const cardinal = stormData ? bearingToCardinal(stormData.bearing) : "";
  const etaMinutes = stormData?.etaMinutes;
  const etaLabel = !Number.isFinite(etaMinutes)
    ? "—"
    : etaMinutes < 1
      ? "< 1 min"
      : etaMinutes < 60
        ? `${etaMinutes} min`
        : `${(etaMinutes / 60).toFixed(1)} hr`;

  return (
    <div
      className="pointer-events-auto mx-auto w-full max-w-lg"
      role="dialog"
      aria-label="Selected radar point"
    >
      <div className="rounded-[1.4rem] border border-white/10 bg-[#10151c]/94 px-3.5 py-3 shadow-2xl backdrop-blur-xl">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-lime-400">
              Storm cell
            </div>
            <div className="text-sm font-semibold text-white">
              {stormData
                ? `${stormData.distanceMi} mi ${cardinal}`
                : "Map point"}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-full bg-white/10 text-slate-300 hover:bg-white/15"
            aria-label="Close storm details"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          <Stat
            icon={Compass}
            label="Dir"
            value={stormData ? `${Math.round(stormData.bearing)}°` : `${inspector?.bearing || "—"}°`}
          />
          <Stat icon={Navigation} label="Speed" value={stormData ? `~${stormData.speedMph}` : "—"} />
          <Stat icon={Clock} label="ETA" value={etaLabel} />
          <Stat
            icon={MapPin}
            label="Loc"
            value={inspector ? `${inspector.lat}, ${inspector.lon}` : "—"}
          />
        </div>
      </div>
    </div>
  );
}
