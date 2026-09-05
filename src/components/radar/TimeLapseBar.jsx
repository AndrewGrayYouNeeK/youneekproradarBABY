import { Pause, Play } from "lucide-react";

const SPEED_OPTIONS = [
  { value: 800, label: "Slow" },
  { value: 400, label: "Med" },
  { value: 180, label: "Fast" },
];

export default function TimeLapseBar({
  enabled,
  playing,
  onToggleEnabled,
  onTogglePlaying,
  frameLabel,
  speed,
  onSpeedChange,
  loopIndex = 0,
  loopFrames = [],
  onSeek,
  embedded = false,
}) {
  const frameCount = loopFrames.length;
  const canScrub = enabled && frameCount > 1 && typeof onSeek === "function";

  const handlePlay = () => {
    if (!enabled) {
      onToggleEnabled();
      return;
    }
    onTogglePlaying();
  };

  const cycleSpeed = () => {
    const index = SPEED_OPTIONS.findIndex((option) => option.value === speed);
    const next = SPEED_OPTIONS[(index + 1) % SPEED_OPTIONS.length];
    onSpeedChange(next.value);
  };

  const speedLabel = SPEED_OPTIONS.find((option) => option.value === speed)?.label || "Med";

  return (
    <div className={embedded ? "px-3 pb-2" : "pointer-events-auto flex items-center gap-2 rounded-2xl border border-white/10 bg-[#10151c]/90 px-3 py-2 shadow-xl backdrop-blur-md"}>
      <div className="flex w-full items-center gap-2.5">
        <button
          type="button"
          onClick={handlePlay}
          aria-label={playing ? "Pause radar loop" : "Play radar loop"}
          className="flex h-10 w-10 min-h-10 min-w-10 shrink-0 items-center justify-center rounded-full bg-lime-400 text-zinc-950 shadow-md"
        >
          {playing ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="ml-0.5 h-4 w-4" aria-hidden="true" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center justify-between gap-2">
            <span className="text-[12px] font-semibold tabular-nums text-white">
              {frameLabel || "Live"}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={onToggleEnabled}
                className={`h-6 min-h-0 rounded-full px-2 py-0 text-[10px] font-bold uppercase tracking-[0.12em] ${
                  enabled ? "bg-white/10 text-slate-300" : "bg-lime-400/15 text-lime-300"
                }`}
              >
                {enabled ? "Loop" : "Live"}
              </button>
              <button
                type="button"
                onClick={cycleSpeed}
                disabled={!enabled}
                aria-label="Radar loop speed"
                className="h-6 min-h-0 rounded-full bg-white/5 px-2 py-0 text-[10px] font-semibold text-slate-300 disabled:opacity-40"
              >
                {speedLabel}
              </button>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={Math.max(0, frameCount - 1)}
            value={canScrub ? loopIndex : Math.max(0, frameCount - 1)}
            disabled={!canScrub}
            onChange={(event) => onSeek(Number(event.target.value))}
            aria-label="Radar loop timeline"
            className="radar-timeline w-full"
          />
        </div>
      </div>
    </div>
  );
}
