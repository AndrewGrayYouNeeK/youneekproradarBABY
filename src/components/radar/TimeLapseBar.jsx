import { Play, Pause, Rewind, FastForward, Clock } from "lucide-react";

export default function TimeLapseBar({ enabled, setEnabled, playing, setPlaying, speed, setSpeed }) {
  return (
    <div className="absolute bottom-24 left-3 right-3 z-20 mx-auto max-w-md">
      <div className="flex items-center gap-2 rounded-2xl border border-border/60 glass-strong px-3 py-2">
        <button
          onClick={() => setEnabled(!enabled)}
          aria-label={enabled ? "Show live radar" : "Show time-lapse"}
          className={`flex h-9 items-center gap-1.5 rounded-xl px-2.5 text-[11px] font-bold uppercase tracking-wide transition-colors ${
            enabled ? "bg-primary text-primary-foreground" : "bg-secondary/60 text-muted-foreground"
          }`}
          style={{ minHeight: "auto" }}
        >
          <Clock className="h-3.5 w-3.5" />
          {enabled ? "Loop" : "Live"}
        </button>

        {enabled && (
          <>
            <button
              onClick={() => setPlaying(!playing)}
              aria-label={playing ? "Pause" : "Play"}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-secondary/60 hover:bg-secondary text-foreground"
              style={{ minHeight: "auto" }}
            >
              {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>

            <div className="flex flex-1 items-center gap-1 rounded-xl bg-secondary/40 p-0.5">
              {[
                { v: "slow", icon: Rewind, label: "Slow" },
                { v: "normal", label: "1x" },
                { v: "fast", icon: FastForward, label: "Fast" },
              ].map(({ v, icon: Icon, label }) => (
                <button
                  key={v}
                  onClick={() => setSpeed(v)}
                  className={`flex h-8 flex-1 items-center justify-center gap-1 rounded-lg text-[10px] font-semibold ${
                    speed === v ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                  }`}
                  style={{ minHeight: "auto" }}
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  {label}
                </button>
              ))}
            </div>

            <div className="text-[10px] font-semibold uppercase tracking-[0.15em] text-primary">
              -60m
            </div>
          </>
        )}
      </div>
    </div>
  );
}