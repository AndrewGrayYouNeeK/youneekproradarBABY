import { Layers, LocateFixed, Minus, Plus } from "lucide-react";

function MapFab({ icon: Icon, label, onClick, active = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex h-11 w-11 min-h-11 min-w-11 items-center justify-center rounded-full border shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md transition-colors ${
        active
          ? "border-lime-400/70 bg-lime-400 text-zinc-950"
          : "border-white/10 bg-[#151b22]/92 text-white hover:bg-[#1d252e]"
      }`}
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
}

export default function RadarControlStack({
  onToggleLayers,
  layersOpen,
  onLocate,
  onZoomIn,
  onZoomOut,
}) {
  return (
    <div
      className="pointer-events-none absolute right-3 z-[1200] flex flex-col gap-2"
      style={{ top: "calc(var(--weather-chrome-top, 6.7rem) + env(safe-area-inset-top))" }}
    >
      <div className="pointer-events-auto flex flex-col gap-2">
        <MapFab icon={Layers} label="Open map layers" onClick={onToggleLayers} active={layersOpen} />
        <MapFab icon={LocateFixed} label="Center radar on my location" onClick={onLocate} />
        <div className="overflow-hidden rounded-full border border-white/10 bg-[#151b22]/92 shadow-[0_8px_24px_rgba(0,0,0,0.45)] backdrop-blur-md">
          <button
            type="button"
            onClick={onZoomIn}
            aria-label="Zoom in"
            className="flex h-11 w-11 min-h-11 min-w-11 items-center justify-center text-white hover:bg-white/10"
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="mx-auto h-px w-6 bg-white/10" />
          <button
            type="button"
            onClick={onZoomOut}
            aria-label="Zoom out"
            className="flex h-11 w-11 min-h-11 min-w-11 items-center justify-center text-white hover:bg-white/10"
          >
            <Minus className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
