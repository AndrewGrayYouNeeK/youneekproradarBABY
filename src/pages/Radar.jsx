import { useState, lazy, Suspense } from "react";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import RadarLegend from "@/components/radar/RadarLegend";
import RadarControls from "@/components/radar/RadarControls";
import RadarBottomSheet from "@/components/radar/RadarBottomSheet";
import LocationSearchBar from "@/components/radar/LocationSearchBar";
import useLocation from "@/hooks/useLocation";
import { Crosshair, Activity, Eye, EyeOff, Globe2, Clock } from "lucide-react";

const RadarMap = lazy(() => import("@/components/radar/RadarMap"));

export default function Radar() {
  const { location } = useLocation();
  const [radarLayer, setRadarLayer] = useState("base_reflectivity");
  const [basemap, setBasemap] = useState("dark");
  const [radarOpacity, setRadarOpacity] = useState(0.7);
  const [timeLapse, setTimeLapse] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState("normal");
  const [globalRadar, setGlobalRadar] = useState(false);
  const [hideUI, setHideUI] = useState(false);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {!hideUI && (
        <AppHeader
          title="Live Radar"
          location={location.label || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
          transparent
          right={
            <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
              {timeLapse ? "Loop" : "Live"}
            </div>
          }
        />
      )}

      {!hideUI && (
        <div className="absolute left-1/2 top-16 z-20 w-full max-w-md -translate-x-1/2 px-3">
          <LocationSearchBar />
        </div>
      )}

      <div className={`absolute inset-0 ${hideUI ? "" : "pt-14"}`}>
        <Suspense fallback={<MapFallback />}>
          <RadarMap
            center={location}
            basemap={basemap}
            radarLayer={radarLayer}
            radarOpacity={radarOpacity}
            timeLapse={timeLapse}
            playing={playing}
            speed={speed}
            globalRadar={globalRadar}
          />
        </Suspense>

        {!hideUI && (
          <>
            <RadarControls
              radarLayer={radarLayer}
              setRadarLayer={setRadarLayer}
              basemap={basemap}
              setBasemap={setBasemap}
              radarOpacity={radarOpacity}
              setRadarOpacity={setRadarOpacity}
            />

            <RadarLegend />

            <div className="absolute right-3 top-[15.25rem] z-20 flex flex-col gap-2.5">
              <button
                aria-label={globalRadar ? "Hide global radar" : "Show global radar"}
                onClick={() => setGlobalRadar((v) => !v)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border glass-strong transition-colors ${
                  globalRadar ? "border-cyan-500/60 text-cyan-400" : "border-border/60 text-foreground hover:bg-secondary"
                }`}
                style={{ minHeight: "auto" }}
              >
                <Globe2 className="h-5 w-5" />
              </button>

              <button
                aria-label={timeLapse ? "Show live radar" : "Show radar loop"}
                onClick={() => setTimeLapse((v) => !v)}
                className={`flex h-11 w-11 items-center justify-center rounded-xl border glass-strong transition-colors ${
                  timeLapse ? "border-primary/60 text-primary" : "border-border/60 text-foreground hover:bg-secondary"
                }`}
                style={{ minHeight: "auto" }}
              >
                <Clock className="h-5 w-5" />
              </button>

              <button
                aria-label="Recenter"
                onClick={() => window.location.reload()}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 glass-strong text-foreground hover:bg-secondary"
                style={{ minHeight: "auto" }}
              >
                <Crosshair className="h-5 w-5" />
              </button>

              <button
                aria-label="Hide controls"
                onClick={() => setHideUI(true)}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 glass-strong text-foreground hover:bg-secondary"
                style={{ minHeight: "auto" }}
              >
                <EyeOff className="h-5 w-5" />
              </button>
            </div>

            <RadarBottomSheet location={location} />
          </>
        )}

        {hideUI && (
          <button
            aria-label="Show controls"
            onClick={() => setHideUI(false)}
            className="absolute top-4 right-3 z-30 flex items-center gap-2 rounded-full border-2 border-primary/70 bg-primary px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-xl shadow-primary/30 hover:bg-primary/90 safe-top"
            style={{ minHeight: "auto" }}
          >
            <Eye className="h-4 w-4" />
            Show Controls
          </button>
        )}
      </div>

      {!hideUI && <BottomNav />}
    </div>
  );
}

function MapFallback() {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Activity className="h-8 w-8 animate-pulse text-primary" />
        <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Loading radar…</div>
      </div>
    </div>
  );
}