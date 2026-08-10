import { useEffect, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import { fetchActiveStorms } from "@/lib/api/storms";

// Hurricane icon — pulsing spiral
const stormIcon = (category) => {
  const color = category >= 3 ? "#dc2626" : category >= 1 ? "#f97316" : "#facc15";
  return L.divIcon({
    className: "storm-marker",
    html: `<div style="position:relative;width:32px;height:32px;">
      <div style="position:absolute;inset:0;border-radius:50%;background:${color}40;animation:pulseRing 2s infinite;"></div>
      <div style="position:absolute;inset:6px;border-radius:50%;background:${color};box-shadow:0 0 0 2px white;display:flex;align-items:center;justify-content:center;color:white;font-weight:900;font-size:14px;">
        🌀
      </div>
    </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });
};

export default function HurricaneLayer({ enabled }) {
  const map = useMap();
  const [storms, setStorms] = useState([]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const load = async () => {
      try {
        const data = await fetchActiveStorms();
        if (!cancelled) setStorms(data);
      } catch {
        if (!cancelled) setStorms([]);
      }
    };
    load();
    const t = setInterval(load, 10 * 60_000);
    return () => { cancelled = true; clearInterval(t); };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    const layers = [];
    storms.forEach((s) => {
      // NHC feed uses different field names depending on storm state.
      const lat = parseFloat(s.latitudeNumeric ?? s.clat ?? s.lat);
      const lon = parseFloat(s.longitudeNumeric ?? s.clon ?? s.lon);
      if (isNaN(lat) || isNaN(lon)) return;

      const wind = parseInt(s.intensity ?? s.intensityMph ?? "0", 10);
      const cat = wind >= 157 ? 5 : wind >= 130 ? 4 : wind >= 111 ? 3 : wind >= 96 ? 2 : wind >= 74 ? 1 : 0;

      const marker = L.marker([lat, lon], { icon: stormIcon(cat) }).addTo(map);
      marker.bindPopup(`
        <div style="min-width:180px;font-family:system-ui;">
          <div style="font-weight:900;font-size:14px;">${s.classification || "TS"} ${s.name || ""}</div>
          <div style="font-size:11px;color:#666;margin-top:2px;">${s.binNumber || ""}</div>
          <div style="margin-top:6px;font-size:12px;">
            <div>Winds: <b>${s.intensity || "—"} mph</b></div>
            <div>Pressure: <b>${s.pressure || "—"} mb</b></div>
            <div>Movement: ${s.movement || "—"}</div>
            ${cat > 0 ? `<div style="margin-top:4px;color:#dc2626;font-weight:700;">Category ${cat}</div>` : ""}
          </div>
        </div>
      `);
      layers.push(marker);
    });
    return () => layers.forEach((l) => l.remove());
  }, [storms, enabled, map]);

  return null;
}