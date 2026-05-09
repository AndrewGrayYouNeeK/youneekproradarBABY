import { useEffect } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

/**
 * Demo-only overlay for App Store screenshots.
 * Renders a fake hurricane (eye + spiral bands) and a fake tornado hook echo
 * near the provided center. Purely visual — no data fetching.
 */
export default function DemoStormLayer({ enabled, center }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || !map) return;

    const lat = Number(center?.[0]) || 27.5;
    const lng = Number(center?.[1]) || -82.5;

    // Hurricane placed offshore to the southeast
    const hLat = lat - 2.2;
    const hLng = lng + 3.5;

    // Tornado placed near user
    const tLat = lat + 0.15;
    const tLng = lng - 0.2;

    const layers = [];

    // ---- Hurricane: outer bands → inner core → eye ----
    const bands = [
      { r: 320000, color: "#5cd5d5", op: 0.25 },
      { r: 240000, color: "#3acb3a", op: 0.35 },
      { r: 180000, color: "#fdfd54", op: 0.45 },
      { r: 120000, color: "#fda835", op: 0.55 },
      { r: 70000, color: "#fb3030", op: 0.7 },
      { r: 35000, color: "#cb38d4", op: 0.8 },
    ];
    bands.forEach((b) => {
      const c = L.circle([hLat, hLng], {
        radius: b.r,
        color: b.color,
        fillColor: b.color,
        fillOpacity: b.op * 0.6,
        opacity: b.op,
        weight: 1,
      }).addTo(map);
      layers.push(c);
    });

    // Eye
    const eye = L.circle([hLat, hLng], {
      radius: 12000,
      color: "#ffffff",
      fillColor: "#0a0f1e",
      fillOpacity: 0.85,
      weight: 2,
    }).addTo(map);
    layers.push(eye);

    // Hurricane label
    const hIcon = L.divIcon({
      className: "demo-hurricane-label",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;">
          <div style="font-size:28px;animation:spin 4s linear infinite;">🌀</div>
          <div style="background:rgba(8,12,24,0.9);border:1px solid rgba(251,48,48,0.6);color:#fff;padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">
            Hurricane Demo · Cat 4
          </div>
        </div>
        <style>@keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}</style>
      `,
      iconSize: [120, 60],
      iconAnchor: [60, 30],
    });
    const hMarker = L.marker([hLat, hLng], { icon: hIcon, interactive: false }).addTo(map);
    layers.push(hMarker);

    // ---- Tornado: hook echo cluster ----
    const hook = [
      { lat: tLat, lng: tLng, r: 8000, color: "#fb3030" },
      { lat: tLat + 0.05, lng: tLng + 0.04, r: 6000, color: "#cb38d4" },
      { lat: tLat + 0.09, lng: tLng + 0.09, r: 5000, color: "#fda835" },
      { lat: tLat + 0.12, lng: tLng + 0.15, r: 4500, color: "#fdfd54" },
      { lat: tLat - 0.04, lng: tLng - 0.05, r: 5500, color: "#cb38d4" },
    ];
    hook.forEach((h) => {
      const c = L.circle([h.lat, h.lng], {
        radius: h.r,
        color: h.color,
        fillColor: h.color,
        fillOpacity: 0.7,
        opacity: 0.9,
        weight: 1,
      }).addTo(map);
      layers.push(c);
    });

    // Tornado label
    const tIcon = L.divIcon({
      className: "demo-tornado-label",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;pointer-events:none;">
          <div style="font-size:24px;">🌪️</div>
          <div style="background:rgba(127,29,29,0.95);border:1px solid rgba(255,255,255,0.4);color:#fff;padding:3px 8px;border-radius:8px;font-size:10px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;white-space:nowrap;">
            Tornado Warning Demo
          </div>
        </div>
      `,
      iconSize: [140, 56],
      iconAnchor: [70, 28],
    });
    const tMarker = L.marker([tLat, tLng], { icon: tIcon, interactive: false }).addTo(map);
    layers.push(tMarker);

    return () => {
      layers.forEach((l) => map.removeLayer(l));
    };
  }, [enabled, map, center]);

  return null;
}