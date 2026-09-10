import { Pause, Play } from "lucide-react";

export default function RadarTimeline({
  frames = [],
  index,
  onIndexChange,
  playing,
  onPlayingChange,
}) {
  if (!frames.length) return null;
  const frame = frames[index] || frames[frames.length - 1];
  const label = frame?.time
    ? new Date(frame.time * 1000).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })
    : "Live";
  const isFuture = Boolean(frame?.future);

  return (
    <div
      className="absolute z-[1100] flex w-[min(28rem,calc(100%-1.5rem))] items-center gap-2 rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 shadow-xl backdrop-blur-md"
      style={{ bottom: "calc(5.75rem + env(safe-area-inset-bottom))", left: "50%", transform: "translateX(-50%)" }}
    >
      <button
        type="button"
        onClick={() => onPlayingChange(!playing)}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white"
        aria-label={playing ? "Pause radar loop" : "Play radar loop"}
      >
        {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </button>
      <input
        type="range"
        min={0}
        max={Math.max(0, frames.length - 1)}
        value={index}
        onChange={(event) => {
          onPlayingChange(false);
          onIndexChange(Number(event.target.value));
        }}
        className="h-1.5 min-h-0 w-full accent-cyan-400"
        aria-label="Radar time"
      />
      <div className={`w-16 shrink-0 text-right text-[11px] font-medium ${isFuture ? "text-amber-300" : "text-white"}`}>
        {isFuture ? `+${label}` : label}
      </div>
    </div>
  );
}
