import L from "leaflet";
import { colorForField } from "@/lib/weather/mapLayers";
import { stormCategory } from "@/lib/api/live";

export function addFieldCircles(map, points, field) {
  const zoom = map.getZoom();
  const radius = Math.max(16, Math.min(42, (zoom - 3) * 8));
  const group = L.layerGroup();

  points.forEach((point) => {
    if (point.value == null) return;
    const color = colorForField(field === "pollen" ? "pollen" : field, point.value);
    L.circleMarker([point.lat, point.lon], {
      radius,
      color,
      fillColor: color,
      fillOpacity: 0.38,
      weight: 0,
      interactive: true,
    })
      .bindTooltip(`${Math.round(point.value)}`, { direction: "top", opacity: 0.9 })
      .addTo(group);
  });

  group.addTo(map);
  return group;
}

export function addLightningLayer(map, geojson) {
  const group = L.geoJSON(geojson, {
    pointToLayer: (_feature, latlng) =>
      L.circleMarker(latlng, {
        radius: 5,
        color: "#fde047",
        fillColor: "#facc15",
        fillOpacity: 0.9,
        weight: 1,
      }),
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      layer.bindPopup(`<strong>Lightning</strong><br/>${props.city || ""}<br/>${props.remark || ""}`);
    },
  });
  group.addTo(map);
  return group;
}

export function addFireLayer(map, geojson) {
  const group = L.geoJSON(geojson, {
    pointToLayer: (feature, latlng) => {
      const acres = Number(feature.properties?.IncidentSize || 0);
      return L.circleMarker(latlng, {
        radius: Math.max(6, Math.min(18, Math.sqrt(acres) / 8)),
        color: "#fb923c",
        fillColor: "#ea580c",
        fillOpacity: 0.75,
        weight: 1,
      });
    },
    onEachFeature: (feature, layer) => {
      const props = feature.properties || {};
      layer.bindPopup(
        `<strong>${props.IncidentName || "Fire"}</strong><br/>${props.POOCounty || ""} ${props.POOState || ""}<br/>${Math.round(props.IncidentSize || 0)} acres · ${Math.round(props.PercentContained || 0)}% contained`
      );
    },
  });
  group.addTo(map);
  return group;
}

export function addStormLayer(map, storms = []) {
  const group = L.layerGroup();
  storms.forEach((storm) => {
    if (storm.latitudeNumeric == null || storm.longitudeNumeric == null) return;
    const marker = L.marker([storm.latitudeNumeric, storm.longitudeNumeric], {
      title: storm.name,
    }).bindPopup(
      `<strong>${storm.name}</strong><br/>${stormClass(storm)} · ${storm.intensity} kt<br/>${storm.pressure} mb`
    );
    marker.addTo(group);
    L.circle([storm.latitudeNumeric, storm.longitudeNumeric], {
      radius: Math.max(40000, Number(storm.intensity || 30) * 1800),
      color: "#fb7185",
      weight: 1,
      fillColor: "#fb7185",
      fillOpacity: 0.12,
    }).addTo(group);
  });
  group.addTo(map);
  return group;
}

function stormClass(storm) {
  return stormCategory(storm.intensity);
}

const SPC_COLORS = {
  TSTM: "#9ca3af",
  MRGL: "#22c55e",
  SLGT: "#eab308",
  ENH: "#f97316",
  MDT: "#ef4444",
  HIGH: "#a855f7",
};

export function addSpcLayer(map, geojson) {
  const group = L.geoJSON(geojson, {
    style: (feature) => {
      const label = String(feature.properties?.LABEL || feature.properties?.label || feature.properties?.CATEGORY || "").toUpperCase();
      const color = SPC_COLORS[label] || "#38bdf8";
      return { color, weight: 1.5, fillColor: color, fillOpacity: 0.22 };
    },
    onEachFeature: (feature, layer) => {
      const label = feature.properties?.LABEL || feature.properties?.CATEGORY || "Outlook";
      layer.bindPopup(`SPC Day-1: ${label}`);
    },
  });
  group.addTo(map);
  return group;
}
