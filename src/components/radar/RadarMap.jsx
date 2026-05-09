import { useEffect, useState, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import HurricaneLayer from "./HurricaneLayer";
import RainViewerLayer from "./RainViewerLayer";
import AlertsPolygonLayer from "./AlertsPolygonLayer";

// Iowa Mesonet tile layer pattern
const IEM_BASE = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";
// Iowa Mesonet RIDGE archive — timestamped frames every 5 min for time-lapse
const IEM_RIDGE = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-{ts}/{z}/{x}/{y}.png";

// Available radar product layers (FREE, no key) — IEM TMS layer names
export const RADAR_LAYERS = {
  base_reflectivity: { name: "Base Reflectivity", layer: "nexrad-n0q", desc: "Standard precipitation radar" },
  echo_tops: { name: "Echo Tops", layer: "nexrad-eet", desc: "Storm height — spot strong cells" },
  precip_1h: { name: "Precip (1hr)", layer: "q2-n1p", desc: "1-hour rainfall accumulation" },
  precip_24h: { name: "Precip (24hr)", layer: "q2-p24h", desc: "24-hour rainfall accumulation" },
};

export const BASEMAP_STYLES = {
  dark: {
    name: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "© CARTO © OSM",
  },
  satellite: {
    name: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "© Esri",
  },
};

// Smooth pan when location changes
function FlyTo({ center }) {
  const map = useMap();
  useEffect(() => {
    if (Number.isFinite(center?.[0]) && Number.isFinite(center?.[1])) {
      map.flyTo(center, map.getZoom(), { duration: 0.8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.[0], center?.[1]]);
  return null;
}

// Build past 12 timestamps (5-min steps, last 60 min), rounded down to nearest 5 min UTC.
function buildTimeLapseFrames() {
  const frames = [];
  const now = new Date();
  now.setUTCSeconds(0, 0);
  const m = now.getUTCMinutes();
  now.setUTCMinutes(m - (m % 5));
  for (let i = 11; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 5 * 60_000);
    const ts =
      t.getUTCFullYear().toString() +
      String(t.getUTCMonth() + 1).padStart(2, "0") +
      String(t.getUTCDate()).padStart(2, "0") +
      String(t.getUTCHours()).padStart(2, "0") +
      String(t.getUTCMinutes()).padStart(2, "0");
    frames.push(ts);
  }
  return frames; // oldest → newest
}

// Static current radar layer
function StaticRadar({ layer, opacity, frameIndex }) {
  const url = `${IEM_BASE}/${layer}/{z}/{x}/{y}.png`;
  return (
    <TileLayer
      key={`${layer}-${frameIndex}`}
      url={url}
      opacity={opacity}
      attribution="NEXRAD via Iowa Mesonet"
      zIndex={400}
    />
  );
}

// Animated time-lapse radar — pre-loads all frames, cycles through them.
function TimeLapseRadar({ opacity, playing, speed }) {
  const frames = useMemo(buildTimeLapseFrames, []);
  const [idx, setIdx] = useState(frames.length - 1);

  useEffect(() => {
    if (!playing) return;
    const intervalMs = speed === "fast" ? 250 : speed === "slow" ? 700 : 450;
    const t = setInterval(() => {
      setIdx((i) => (i + 1) % frames.length);
    }, intervalMs);
    return () => clearInterval(t);
  }, [playing, speed, frames.length]);

  return (
    <>
      {frames.map((ts, i) => (
        <TileLayer
          key={ts}
          url={IEM_RIDGE.replace("{ts}", ts)}
          opacity={i === idx ? opacity : 0}
          attribution="NEXRAD via Iowa Mesonet"
          zIndex={400 + i}
        />
      ))}
    </>
  );
}

// Expose current frame timestamp (for the timeline UI)
function useTimeLapseClock(playing, speed, framesLength) {
  const [idx, setIdx] = useState(framesLength - 1);
  useEffect(() => {
    if (!playing) return;
    const intervalMs = speed === "fast" ? 250 : speed === "slow" ? 700 : 450;
    const t = setInterval(() => setIdx((i) => (i + 1) % framesLength), intervalMs);
    return () => clearInterval(t);
  }, [playing, speed, framesLength]);
  return [idx, setIdx];
}

// User location marker (pulse)
const userIcon = L.divIcon({
  className: "user-location-marker",
  html: `<div style="position:relative;width:18px;height:18px;">
    <div style="position:absolute;inset:0;border-radius:50%;background:rgba(56,189,248,0.4);animation:pulseRing 2s infinite;"></div>
    <div style="position:absolute;inset:4px;border-radius:50%;background:rgb(56,189,248);box-shadow:0 0 0 2px white;"></div>
  </div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

export default function RadarMap({
  center,
  basemap = "dark",
  radarLayer = "base_reflectivity",
  radarOpacity = 0.7,
  zoom = 2,
  timeLapse = false,
  playing = true,
  speed = "normal",
  hurricanes = false,
  globalRadar = false,
  alertPolygons = true,
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  // Auto-refresh static radar every 60s
  useEffect(() => {
    if (timeLapse) return;
    const t = setInterval(() => setFrameIndex((i) => i + 1), 60_000);
    return () => clearInterval(t);
  }, [timeLapse]);

  const basemapCfg = BASEMAP_STYLES[basemap] || BASEMAP_STYLES.dark;
  const radarCfg = RADAR_LAYERS[radarLayer] || RADAR_LAYERS.base_reflectivity;

  const mapCenter = useMemo(() => {
    const lat = Number(center?.latitude);
    const lng = Number(center?.longitude);
    return [Number.isFinite(lat) ? lat : 39.5, Number.isFinite(lng) ? lng : -98.35];
  }, [center?.latitude, center?.longitude]);

  return (
    <div className="absolute inset-0" style={{ zIndex: 0, isolation: "isolate" }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        minZoom={2}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full bg-background"
        worldCopyJump
      >
        <TileLayer url={basemapCfg.url} attribution={basemapCfg.attribution} zIndex={100} />

        {timeLapse ? (
          <TimeLapseRadar opacity={radarOpacity} playing={playing} speed={speed} />
        ) : (
          <StaticRadar layer={radarCfg.layer} opacity={radarOpacity} frameIndex={frameIndex} />
        )}

        {globalRadar && <RainViewerLayer opacity={radarOpacity} />}

        <HurricaneLayer enabled={hurricanes} />

        {alertPolygons && <AlertsPolygonLayer center={center} />}

        <FlyTo center={mapCenter} />
        <Marker position={mapCenter} icon={userIcon} />
        <Circle
          center={mapCenter}
          radius={50_000}
          pathOptions={{ color: "#38bdf8", weight: 1, opacity: 0.3, fillOpacity: 0 }}
        />
      </MapContainer>
    </div>
  );
}