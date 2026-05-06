import { useEffect, useState, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Iowa Mesonet tile layer pattern
const IEM_BASE = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";

// Available radar product layers (FREE, no key) — IEM TMS layer names
export const RADAR_LAYERS = {
  base_reflectivity: { name: "Base Reflectivity", layer: "nexrad-n0q", desc: "Standard precipitation radar" },
  echo_tops: { name: "Echo Tops", layer: "nexrad-eet", desc: "Storm height — spot strong cells" },
  precip_1h: { name: "Precip (1hr)", layer: "q2-n1p", desc: "1-hour rainfall accumulation" },
  precip_24h: { name: "Precip (24hr)", layer: "q2-p24h", desc: "24-hour rainfall accumulation" },
  precip_72h: { name: "Precip (72hr)", layer: "q2-p72h", desc: "72-hour rainfall accumulation" },
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
    if (center?.[0] && center?.[1]) {
      map.flyTo(center, map.getZoom(), { duration: 0.8 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.[0], center?.[1]]);
  return null;
}

// Animated tile rotator for radar loop
function RadarLoop({ layer, opacity, frameIndex }) {
  // IEM offers ridge mosaics with timestamps every 5 min — for animation use n0q
  // We layer one tile and force re-render via key
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

// Lightning strike icon
const lightningIcon = L.divIcon({
  className: "lightning-marker",
  html: `<div style="font-size:14px;text-shadow:0 0 6px #fde047, 0 0 12px #fbbf24;">⚡</div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export default function RadarMap({
  center,
  basemap = "dark",
  radarLayer = "base_reflectivity",
  radarOpacity = 0.7,
  zoom = 8,
}) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [animating, setAnimating] = useState(true);

  // Auto-refresh radar every 60s
  useEffect(() => {
    if (!animating) return;
    const t = setInterval(() => setFrameIndex((i) => i + 1), 60_000);
    return () => clearInterval(t);
  }, [animating]);

  const basemapCfg = BASEMAP_STYLES[basemap] || BASEMAP_STYLES.dark;
  const radarCfg = RADAR_LAYERS[radarLayer] || RADAR_LAYERS.base_reflectivity;

  const mapCenter = useMemo(() => [center.latitude, center.longitude], [center.latitude, center.longitude]);

  return (
    <div className="absolute inset-0" style={{ zIndex: 0, isolation: "isolate" }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full bg-background"
        worldCopyJump
      >
        <TileLayer
          url={basemapCfg.url}
          attribution={basemapCfg.attribution}
          zIndex={100}
        />

        <RadarLoop layer={radarCfg.layer} opacity={radarOpacity} frameIndex={frameIndex} />

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