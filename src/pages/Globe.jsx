import { lazy, Suspense, useEffect, useMemo, useState } from "react";
import { Flame, Globe2, Pause, Play, Sparkles, Wind } from "lucide-react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import useRainViewer from "@/hooks/useRainViewer";
import { useActiveFires, useLightning, useNhcStorms } from "@/hooks/useLiveHazards";
import { getRainViewerFrames } from "@/lib/api/rainviewer";

const WeatherGlobe = lazy(() => import("@/components/radar/WeatherGlobe"));

export default function GlobePage() {
  useTabPageMemory("Globe");
  const { coords } = useWeatherLocation();
  const { data: catalog } = useRainViewer();
  const { data: stormsData } = useNhcStorms();
  const { data: firesData } = useActiveFires();
  const { data: lightningData } = useLightning();
  const [playing, setPlaying] = useState(true);
  const [frameIndex, setFrameIndex] = useState(0);
  const [showStorms, setShowStorms] = useState(true);
  const [showFires, setShowFires] = useState(true);
  const [showLightning, setShowLightning] = useState(true);

  const frames = useMemo(() => getRainViewerFrames(catalog, "radar"), [catalog]);
  const frame = frames[Math.min(frameIndex, Math.max(0, frames.length - 1))] || frames[frames.length - 1];
  const storms = showStorms ? stormsData?.activeStorms || [] : [];

  useEffect(() => {
    if (frames.length) setFrameIndex(frames.length - 1);
  }, [catalog?.generated, frames.length]);

  useEffect(() => {
    if (!playing || frames.length < 2) return undefined;
    const timer = setInterval(() => {
      setFrameIndex((index) => (index + 1) % frames.length);
    }, 500);
    return () => clearInterval(timer);
  }, [playing, frames.length]);

  const userLocation = coords
    ? { lat: coords.latitude, lon: coords.longitude }
    : null;

  return (
    <div className="safe-screen h-screen overflow-hidden bg-black pb-24">
      <AppHeader title="3D Globe" />
      <div className="relative h-[calc(100%-3.5rem-env(safe-area-inset-top))] w-full">
        <Suspense
          fallback={(
            <div className="flex h-full items-center justify-center bg-black text-xs uppercase tracking-[0.2em] text-slate-400">
              Loading globe
            </div>
          )}
        >
          <WeatherGlobe
            catalog={catalog}
            frame={frame}
            userLocation={userLocation}
            storms={storms}
            center={coords ? { lat: coords.latitude, lng: coords.longitude } : null}
          />
        </Suspense>

        <div className="absolute left-3 right-3 z-[20] flex flex-wrap gap-2" style={{ top: "0.75rem" }}>
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="inline-flex items-center gap-1 rounded-full bg-slate-950/70 px-3 py-2 text-xs font-semibold text-white"
            aria-label={playing ? "Pause radar loop" : "Play radar loop"}
          >
            {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            Loop
          </button>
          <div className="rounded-full bg-slate-950/70 px-3 py-2 text-xs text-slate-300">
            {frames.length ? `${frameIndex + 1}/${frames.length}` : "Loading radar"}
          </div>
        </div>

        <div className="absolute bottom-4 left-3 right-3 z-[20] grid grid-cols-3 gap-2">
          <ToggleChip icon={Wind} label="Storms" active={showStorms} onClick={() => setShowStorms((v) => !v)} />
          <ToggleChip
            icon={Sparkles}
            label={`Lightning${showLightning && lightningData?.features ? ` ${Math.min(lightningData.features.length, 99)}` : ""}`}
            active={showLightning}
            onClick={() => setShowLightning((v) => !v)}
          />
          <ToggleChip
            icon={Flame}
            label={`Fires${showFires && firesData?.features ? ` ${Math.min(firesData.features.length, 99)}` : ""}`}
            active={showFires}
            onClick={() => setShowFires((v) => !v)}
          />
        </div>

        <div className="pointer-events-none absolute left-3 top-16 z-[20] flex items-center gap-2 text-[11px] text-sky-200/80">
          <Globe2 className="h-3.5 w-3.5" />
          Live global radar on a 3D Earth — drag to spin, pinch to zoom
        </div>
      </div>
      <BottomTab />
    </div>
  );
}

function ToggleChip({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] font-semibold ${
        active ? "bg-white/15 text-white" : "bg-slate-950/70 text-slate-400"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
