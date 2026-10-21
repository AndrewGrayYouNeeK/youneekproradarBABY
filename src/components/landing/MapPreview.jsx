import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Pause, Play, Radio } from "lucide-react";
import { outlineStyle, radarFrameStamps } from "@/lib/landing/briefing";
import { RADAR_APP_URL } from "@/lib/landing/radarApp";

const NEXRAD_ARCHIVE = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0Q-";

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, (character) => {
    switch (character) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      case "'":
        return "&#39;";
      default: {
        const unexpected = character;
        return unexpected;
      }
    }
  });
}
const DARK_BASE = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";

export default function MapPreview({ latitude, longitude, alerts = [] }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const radarRef = useRef(null);
  const warningsRef = useRef(null);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [frames, setFrames] = useState(() => radarFrameStamps());
  const [frameIdx, setFrameIdx] = useState(0);
  const [playing, setPlaying] = useState(() => {
    if (typeof window === "undefined" || !window.matchMedia) return true;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    if (!mapEl.current || mapRef.current) return undefined;

    const map = L.map(mapEl.current, {
      center: [39.5, -98.35],
      zoom: 4,
      zoomControl: true,
      attributionControl: false,
    });
    mapRef.current = map;
    L.tileLayer(DARK_BASE, { maxZoom: 10 }).addTo(map);
    const stamps = radarFrameStamps();
    setFrames(stamps);
    setFrameIdx(0);
    const radar = L.tileLayer(`${NEXRAD_ARCHIVE}${stamps[0].stamp}/{z}/{x}/{y}.png`, {
      opacity: 0.8,
      maxZoom: 10,
    }).addTo(map);
    radarRef.current = radar;
    warningsRef.current = L.layerGroup().addTo(map);
    radar.on("load", () => setLoading(false));
    const giveUp = window.setTimeout(() => setLoading(false), 8000);
    const refresh = window.setInterval(() => {
      const next = radarFrameStamps();
      setFrames(next);
      setFrameIdx(0);
    }, 120000);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    map.invalidateSize();

    return () => {
      window.clearTimeout(giveUp);
      window.clearInterval(refresh);
      window.removeEventListener("resize", onResize);
      map.remove();
      mapRef.current = null;
      radarRef.current = null;
      warningsRef.current = null;
      markerRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!playing || frames.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setFrameIdx((index) => (index + 1) % frames.length);
    }, 900);
    return () => window.clearInterval(timer);
  }, [playing, frames.length]);

  useEffect(() => {
    const frame = frames[frameIdx];
    if (!radarRef.current || !frame) return;
    radarRef.current.setUrl(`${NEXRAD_ARCHIVE}${frame.stamp}/{z}/{x}/{y}.png`);
  }, [frames, frameIdx]);

  useEffect(() => {
    const group = warningsRef.current;
    if (!group) return;
    group.clearLayers();
    alerts.forEach((alert) => {
      if (!alert.geometry) return;
      const layer = L.geoJSON(alert.geometry, { style: outlineStyle(alert.severity) });
      const event = escapeHtml(alert.event);
      const headline = escapeHtml(alert.headline);
      layer.bindPopup(
        `<div style="font-family:monospace;color:#111;min-width:180px"><strong>${event}</strong><div>${headline}</div></div>`
      );
      layer.addTo(group);
      layer.bringToFront();
    });
  }, [alerts]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !Number.isFinite(latitude) || !Number.isFinite(longitude)) return;
    if (markerRef.current) markerRef.current.remove();
    const icon = L.divIcon({
      className: "",
      html: '<span class="ynk-gps-dot"></span>',
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });
    markerRef.current = L.marker([latitude, longitude], { icon, zIndexOffset: 1000 }).addTo(map);
    map.setView([latitude, longitude], 7, { animate: false });
  }, [latitude, longitude]);

  const frame = frames[frameIdx];
  const clock = frame ? new Date(frame.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) : "";

  return (
    <section id="maps" className="scroll-mt-24 px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4">
          <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#00ff9c]">// NEXRAD_LIVE_FEED</div>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Precipitation <span className="ynk-neon">radar</span>
          </h2>
          <p className="mt-2 max-w-xl text-sm text-white/70">
            A short reflectivity loop, warning outlines, and your location. Lightning and other pro layers stay in the radar app.
          </p>
        </div>

        <div className="ynk-map relative isolate border border-[#00ff9c]/30 bg-black">
          <div ref={mapEl} className="h-[300px] w-full md:h-[460px]" />
          {loading && (
            <div className="absolute inset-0 z-[400] flex items-center justify-center bg-black/60">
              <div className="border border-[#00ff9c]/40 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.3em] text-[#00ff9c]">
                Connecting to NEXRAD…
              </div>
            </div>
          )}
          <a
            href={RADAR_APP_URL}
            className="absolute bottom-3 left-3 z-[400] bg-[#00ff9c] px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-black"
          >
            Open Radar
          </a>
          <div className="absolute bottom-3 right-3 z-[400] bg-black/75 px-2 py-1 font-mono text-[9px] text-white/60">
            <Radio className="mr-1 inline h-3 w-3 text-[#00ff9c]" aria-hidden="true" />
            Iowa Mesonet N0Q
          </div>
        </div>

        <div className="mt-3 flex items-center gap-3 border border-white/15 bg-black/80 px-3 py-2">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center bg-[#00ff9c] text-black"
            aria-label={playing ? "Pause radar loop" : "Play radar loop"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <div className="text-xs text-white/80">
            {playing ? "Looping" : "Paused"} · {clock} · {frameIdx + 1}/{frames.length}
          </div>
        </div>
      </div>
    </section>
  );
}
