import { useState, lazy, Suspense } from "react";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import RadarLegend from "@/components/radar/RadarLegend";
import RadarControls from "@/components/radar/RadarControls";
import useLocation from "@/hooks/useLocation";
import { Crosshair, Activity } from "lucide-react";

const RadarMap = lazy(() => import("@/components/radar/RadarMap"));

export default function Radar() {
  const { location } = useLocation();
  const [radarLayer, setRadarLayer] = useState("base_reflectivity");
  const [basemap, setBasemap] = useState("dark");
  const [radarOpacity, setRadarOpacity] = useState(0.7);

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      <AppHeader
        title="Live Radar"
        location={location.label || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
        transparent
        right={
          <div className="flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-400">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
            Live
          </div>
        }
      />

      <div className="absolute inset-0 pt-14">
        <Suspense fallback={<MapFallback />}>
          <RadarMap
            center={location}
            basemap={basemap}
            radarLayer={radarLayer}
            radarOpacity={radarOpacity}
          />
        </Suspense>

        <RadarControls
          radarLayer={radarLayer}
          setRadarLayer={setRadarLayer}
          basemap={basemap}
          setBasemap={setBasemap}
          radarOpacity={radarOpacity}
          setRadarOpacity={setRadarOpacity}
        />

        <RadarLegend />

        <button
          aria-label="Recenter"
          onClick={() => window.location.reload()}
          className="absolute bottom-24 right-3 z-10 flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 glass-strong text-foreground hover:bg-secondary"
          style={{ minHeight: "auto" }}
        >
          <Crosshair className="h-5 w-5" />
        </button>
      </div>

      <BottomNav />
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