import { Pause, Play, Radio, LocateFixed, LoaderCircle } from "lucide-react";
import MobileSelect from "@/components/mobile/MobileSelect";
import { useRadio } from "@/lib/RadioContext";

export default function RadioControls() {
  const {
    station,
    stationId,
    setStationId,
    isPlaying,
    isBuffering,
    isLocating,
    togglePlayback,
    stations,
  } = useRadio();

  const statusLabel = isLocating ? "Finding nearest" : isBuffering ? "Connecting…" : isPlaying ? "Live" : "Ready";
  const statusTone = isPlaying ? "text-lime-300 bg-lime-500/15 border-lime-500/30" : "text-slate-300 bg-white/5 border-white/10";

  return (
    <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-3">
      <div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Radio</div>
        <div className="mt-1 text-xs text-slate-500">Live NOAA weather audio. Same player as the Radio tab.</div>
      </div>

      <div className="rounded-xl border border-white/10 bg-slate-900/70 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-widest text-slate-200">
              <Radio size={12} aria-hidden="true" />
              NOAA WEATHER RADIO
            </div>
            <div className="mt-2 truncate text-sm font-semibold text-white">{station.label}</div>
          </div>
          <div className={`flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold ${statusTone}`}>
            {isLocating ? <LocateFixed size={11} className="animate-pulse" aria-hidden="true" /> : isBuffering ? <LoaderCircle size={11} className="animate-spin" aria-hidden="true" /> : <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />}
            {statusLabel}
          </div>
        </div>
      </div>

      <MobileSelect
        label="Radio Station"
        value={stationId}
        onChange={setStationId}
        options={stations.map((item) => ({ value: item.id, label: item.label }))}
      />

      <button
        type="button"
        onClick={togglePlayback}
        aria-label={isPlaying ? "Stop local NOAA weather radio" : "Play local NOAA weather radio"}
        className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-lime-400/40 bg-lime-400/15 px-3 py-3 text-sm font-semibold text-lime-200 transition-colors hover:bg-lime-400/20"
      >
        {isBuffering ? <LoaderCircle size={16} className="animate-spin" aria-hidden="true" /> : isPlaying ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
        {isBuffering ? "Connecting…" : isPlaying ? "Stop Live Radio" : "Play Live Radio"}
      </button>
    </div>
  );
}
