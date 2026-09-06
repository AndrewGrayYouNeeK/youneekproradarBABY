export const MAP_FEATURE_GROUPS = [
  { id: "overlays", label: "Map overlays" },
  { id: "warnings", label: "Warnings" },
  { id: "desk", label: "Pro desk" },
  { id: "safety", label: "Safety" },
];

export const MAP_FEATURES = [
  { id: "radar", label: "Radar", group: "overlays", kind: "layer", defaultDock: true },
  { id: "lightning", label: "Lightning", group: "overlays", kind: "layer", defaultDock: true },
  { id: "satellite", label: "Satellite", group: "overlays", kind: "layer", defaultDock: true },
  { id: "hurricanes", label: "Storms", group: "overlays", kind: "layer", defaultDock: true },
  { id: "loop", label: "Loop", group: "overlays", kind: "action", defaultDock: false },
  { id: "alerts", label: "Alerts", group: "warnings", kind: "layer", defaultDock: true },
  { id: "tornado", label: "Tornado", group: "warnings", kind: "layer", defaultDock: false },
  { id: "severe", label: "Severe", group: "warnings", kind: "layer", defaultDock: false },
  { id: "flood", label: "Flood", group: "warnings", kind: "layer", defaultDock: false },
  { id: "winter", label: "Winter", group: "warnings", kind: "layer", defaultDock: false },
  { id: "now", label: "Now", group: "desk", kind: "route", path: "/Forecast", defaultDock: false },
  { id: "hourly", label: "Hourly", group: "desk", kind: "route", path: "/Hourly", defaultDock: false },
  { id: "daily", label: "10 Day", group: "desk", kind: "route", path: "/Daily", defaultDock: false },
  { id: "radio", label: "Radio", group: "desk", kind: "route", path: "/Radio", defaultDock: true },
  { id: "globe", label: "Globe", group: "desk", kind: "route", path: "/Globe", defaultDock: false },
  { id: "settings", label: "Settings", group: "desk", kind: "route", path: "/Settings", defaultDock: false },
  { id: "contacts", label: "Contacts", group: "safety", kind: "route", path: "/Contacts", defaultDock: false },
  { id: "help", label: "Help Me", group: "safety", kind: "action", defaultDock: false },
  { id: "safe", label: "I'm Safe", group: "safety", kind: "action", defaultDock: false },
];

export const MAP_FEATURE_IDS = new Set(MAP_FEATURES.map((feature) => feature.id));
export const DEFAULT_DOCK_IDS = MAP_FEATURES.filter((feature) => feature.defaultDock).map((feature) => feature.id);
export const MAX_DOCK_CHIPS = 8;
export const MAP_DOCK_STORAGE_KEY = "mapDock_v1";

export function getMapFeature(id) {
  return MAP_FEATURES.find((feature) => feature.id === id);
}

export function loadDockIds() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MAP_DOCK_STORAGE_KEY) || "null");
    if (!Array.isArray(parsed)) return DEFAULT_DOCK_IDS;
    const next = parsed.filter((id) => MAP_FEATURE_IDS.has(id));
    return next.length ? next.slice(0, MAX_DOCK_CHIPS) : DEFAULT_DOCK_IDS;
  } catch {
    return DEFAULT_DOCK_IDS;
  }
}

export function saveDockIds(ids) {
  const next = ids.filter((id) => MAP_FEATURE_IDS.has(id)).slice(0, MAX_DOCK_CHIPS);
  localStorage.setItem(MAP_DOCK_STORAGE_KEY, JSON.stringify(next));
  return next;
}
