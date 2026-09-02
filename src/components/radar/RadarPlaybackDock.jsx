import { CloudLightning, LayoutGrid, Radar, Satellite, ShieldAlert, Zap } from "lucide-react";
import TimeLapseBar from "./TimeLapseBar";
import ProLegend from "./ProLegend";

const LAYER_CHIPS = [
  { id: "radar", label: "Radar", icon: Radar },
  { id: "lightning", label: "Lightning", icon: Zap },
  { id: "satellite", label: "Satellite", icon: Satellite },
  { id: "hurricanes", label: "Storms", icon: CloudLightning },
  { id: "alerts", label: "Alerts", icon: ShieldAlert },
];

function LayerChip({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex h-10 min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
        active
          ? "border-lime-400/70 bg-lime-400 text-zinc-950"
          : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
      }`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </button>
  );
}

export default function RadarPlaybackDock({
  layers,
  onLayerChange,
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
      <div className="flex gap-2 overflow-x-auto px-3 pt-3 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {LAYER_CHIPS.map(({ id, label, icon }) => (
            <LayerChip
              key={id}
              icon={icon}
              label={label}
              active={Boolean(layers[id])}
              onClick={() => onLayerChange(id, !layers[id])}
            />
          ))}
          <LayerChip icon={LayoutGrid} label="More" active={false} onClick={onOpenMore} />
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
