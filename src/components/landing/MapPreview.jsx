import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { AlertTriangle, Radio } from "lucide-react";
import { RADAR_APP_URL } from "@/lib/landing/radarApp";

const NEXRAD_BASE = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913";
const DARK_BASE = "https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}";

export default function MapPreview({ latitude, longitude }) {
  const mapEl = useRef(null);
  const mapRef = useRef(null);
  const radarRef = useRef(null);
  const markerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [warningCount, setWarningCount] = useState(0);

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
    const radar = L.tileLayer(`${NEXRAD_BASE}/{z}/{x}/{y}.png`, { opacity: 0.78, maxZoom: 10 }).addTo(map);
    radarRef.current = radar;
    radar.on("load", () => setLoading(false));
    const giveUp = window.setTimeout(() => setLoading(false), 8000);

    let cancelled = false;
    const loadWarnings = async () => {
      try {
        const response = await fetch("https://api.weather.gov/alerts/active?event=Tornado%20Warning", {
          headers: { Accept: "application/geo+json" },
        });
        if (!response.ok) return;
        const data = await response.json();
        if (cancelled || !mapRef.current) return;
        const features = (data.features || []).filter((feature) => feature.geometry);
        features.forEach((feature) => {
          L.geoJSON(feature.geometry, {
            style: {
              color: "#ff0033",
              weight: 2,
              fillColor: "#ff0033",
              fillOpacity: 0.18,
              dashArray: "4,3",
            },
          }).addTo(mapRef.current);
        });
        setWarningCount(features.length);
      } catch {
        /* Map still shows radar if warnings are blocked. */
      }
    };
    loadWarnings();

    const refresh = window.setInterval(() => {
      radarRef.current?.setUrl(`${NEXRAD_BASE}/{z}/{x}/{y}.png?ts=${Date.now()}`);
    }, 120000);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    map.invalidateSize();

    return () => {
      cancelled = true;
      window.clearTimeout(giveUp);
      window.clearInterval(refresh);
      window.removeEventListener("resize", onResize);
      map.remove();
      mapRef.current = null;
      radarRef.current = null;
      markerRef.current = null;
    };
  }, []);

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

  return (
    <section id="maps" className="scroll-mt-24 px-4 py-16 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="mb-2 font-mono text-[10px] uppercase tracking-[0.35em] text-[#00ff9c]">// NEXRAD_LIVE_FEED</div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
              Live <span className="ynk-neon">NEXRAD</span> map
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/70">
              Base reflectivity centered on you. The full desk, loop, and alerts open in the radar app.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 font-mono text-[10px] uppercase tracking-[0.22em]">
            <span className="inline-flex items-center gap-2 text-[#00ff9c]">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#00ff9c]" />
              Live
            </span>
            <span className={warningCount > 0 ? "text-[#ff4d6a]" : "text-white/45"}>
              <AlertTriangle className="mr-1 inline h-3 w-3" aria-hidden="true" />
              {warningCount} tor warn
            </span>
          </div>
        </div>

        <div className="ynk-map relative isolate border border-[#00ff9c]/30 bg-black">
          <span className="absolute -left-px -top-px z-[401] h-4 w-4 border-l-2 border-t-2 border-[#00ff9c]" />
          <span className="absolute -right-px -top-px z-[401] h-4 w-4 border-r-2 border-t-2 border-[#ff00d4]" />
          <span className="absolute -bottom-px -left-px z-[401] h-4 w-4 border-b-2 border-l-2 border-[#ff00d4]" />
          <span className="absolute -bottom-px -right-px z-[401] h-4 w-4 border-b-2 border-r-2 border-[#00ff9c]" />
          <div ref={mapEl} className="h-[320px] w-full md:h-[480px]" />
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
            Open this map
          </a>
          <div className="absolute bottom-3 right-3 z-[400] bg-black/75 px-2 py-1 font-mono text-[9px] text-white/60">
            <Radio className="mr-1 inline h-3 w-3 text-[#00ff9c]" aria-hidden="true" />
            NOAA NEXRAD · Iowa State Mesonet
          </div>
        </div>
      </div>
    </section>
  );
}
