import {
  CalendarDays,
  Clock,
  CloudLightning,
  CloudRain,
  CloudSnow,
  CloudSun,
  Globe,
  LayoutGrid,
  Radar,
  Radio,
  Repeat,
  Satellite,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";
import TimeLapseBar from "./TimeLapseBar";
import ProLegend from "./ProLegend";
import { getMapFeature } from "@/lib/mapDesk";

const ICONS = {
  radar: Radar,
  lightning: Zap,
  satellite: Satellite,
  hurricanes: CloudLightning,
  loop: Repeat,
  alerts: ShieldAlert,
  tornado: ShieldAlert,
  severe: CloudLightning,
  flood: CloudRain,
  winter: CloudSnow,
  now: CloudSun,
  hourly: Clock,
  daily: CalendarDays,
  radio: Radio,
  globe: Globe,
  settings: Settings,
  contacts: Users,
  help: ShieldAlert,
  safe: ShieldCheck,
};

function chipTone(id, active) {
  if (id === "help") {
    return active
      ? "border-red-500 bg-red-600 text-white"
      : "border-red-500/50 bg-red-950/70 text-red-100";
  }
  if (id === "safe") {
    return active
      ? "border-lime-400 bg-lime-400 text-zinc-950"
      : "border-lime-400/40 bg-lime-400/15 text-lime-100";
  }
  return active
    ? "border-lime-400/70 bg-lime-400 text-zinc-950"
    : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10";
}

function LayerChip({ id, label, active, onClick }) {
  const Icon = ICONS[id] || LayoutGrid;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-10 min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${chipTone(id, active)}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

export default function RadarPlaybackDock({
  dockIds = [],
  layers = {},
  onChipClick,
  onOpenMore,
  loopEnabled,
  loopPlaying,
  loopSpeed,
  loopIndex,
  loopFrames,
  frameLabel,
  onToggleLoop,
  onTogglePlaying,
  onSpeedChange,
  onSeek,
  productLabel,
}) {
  return (
    <div className="pointer-events-auto mx-auto w-full max-w-xl overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#10151c]/94 shadow-[0_18px_50px_rgba(0,0,0,0.55)] backdrop-blur-xl">
      <div className="flex items-center gap-2 px-3 pt-3 pb-2">
        <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {dockIds.map((id) => {
            const feature = getMapFeature(id);
            if (!feature) return null;
            return (
              <LayerChip
                key={id}
                id={id}
                label={feature.label}
                active={Boolean(layers[id])}
                onClick={() => onChipClick(id)}
              />
            );
          })}
        </div>
        <LayerChip id="more" label="More" active={false} onClick={onOpenMore} />
      </div>

      <TimeLapseBar
        embedded
        enabled={loopEnabled}
        playing={loopPlaying}
        frameLabel={frameLabel}
        speed={loopSpeed}
        loopIndex={loopIndex}
        loopFrames={loopFrames}
        onToggleEnabled={onToggleLoop}
        onTogglePlaying={onTogglePlaying}
        onSpeedChange={onSpeedChange}
        onSeek={onSeek}
      />

      <ProLegend embedded productLabel={productLabel} />
    </div>
  );
}
