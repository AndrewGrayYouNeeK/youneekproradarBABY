import { useQuery } from "@tanstack/react-query";
import { GeoJSON } from "react-leaflet";
import { fetchActiveAlerts, alertSeverity } from "@/lib/weather/api";

// Map severity tier → polygon color (NWS-inspired)
const TIER_COLOR = {
  extreme: "#ef4444",  // red
  severe: "#f97316",   // orange
  warning: "#eab308",  // yellow
  watch: "#f59e0b",    // amber
  advisory: "#22d3ee", // cyan
  info: "#94a3b8",     // slate
};

// Render NWS active-alert polygons over the map.
export default function AlertsPolygonLayer({ center }) {
  const { data } = useQuery({
    queryKey: ["alertPolygons", center?.latitude, center?.longitude],
    queryFn: () => fetchActiveAlerts(center.latitude, center.longitude),
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
    enabled: Number.isFinite(center?.latitude) && Number.isFinite(center?.longitude),
  });

  const features = (data?.features || []).filter((f) => f.geometry); // only those with polygons
  if (features.length === 0) return null;

  // Sort so severe ones render on top
  features.sort(
    (a, b) =>
      alertSeverity(a.properties?.event).priority -
      alertSeverity(b.properties?.event).priority
  );

  return features.map((f) => {
    const sev = alertSeverity(f.properties?.event);
    const color = TIER_COLOR[sev.tier] || TIER_COLOR.info;
    return (
      <GeoJSON
        key={f.id || f.properties?.id}
        data={f}
        style={{
          color,
          weight: 2,
          opacity: 0.9,
          fillColor: color,
          fillOpacity: 0.18,
        }}
        onEachFeature={(feature, layer) => {
          const p = feature.properties || {};
          layer.bindPopup(
            `<div style="font-family:system-ui;max-width:260px">
               <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.1em;color:${color}">${p.severity || sev.tier}</div>
               <div style="font-weight:700;margin-top:2px">${p.event || ""}</div>
               <div style="font-size:11px;color:#64748b;margin-top:2px">${p.areaDesc || ""}</div>
             </div>`
          );
        }}
      />
    );
  });
}