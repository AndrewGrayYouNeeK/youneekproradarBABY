export const IEM_TILE = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";

export const MAP_LAYER_GROUPS = ["Radar", "Satellite", "Hazards", "Atmosphere", "Health"];

export const MAP_LAYERS = [
  {
    id: "radar",
    group: "Radar",
    label: "Live Radar",
    description: "NEXRAD base reflectivity mosaic",
    kind: "tile",
    tileUrl: `${IEM_TILE}/ridge::USCOMP-N0Q-0/{z}/{x}/{y}.png`,
    opacity: 0.78,
    maxNativeZoom: 12,
    legend: "dbz",
  },
  {
    id: "past",
    group: "Radar",
    label: "Past Radar",
    description: "Replay the last ~2 hours of global radar",
    kind: "rainviewer-radar",
    opacity: 0.8,
    legend: "dbz",
  },
  {
    id: "future",
    group: "Radar",
    label: "1-hr Future Radar",
    description: "Nowcasted radar through the next hour",
    kind: "rainviewer-nowcast",
    opacity: 0.8,
    legend: "dbz",
  },
  {
    id: "simulated",
    group: "Radar",
    label: "Global Pulse Radar",
    description: "Worldwide simulated radar where NEXRAD is unavailable",
    kind: "rainviewer-radar",
    opacity: 0.82,
    legend: "dbz",
  },
  {
    id: "velocity",
    group: "Radar",
    label: "Velocity",
    description: "Base velocity — green inbound, red outbound",
    kind: "tile",
    tileUrl: `${IEM_TILE}/ridge::USCOMP-N0U-0/{z}/{x}/{y}.png`,
    opacity: 0.78,
    maxNativeZoom: 12,
    legend: "velocity",
  },
  {
    id: "srvelocity",
    group: "Radar",
    label: "Storm-Relative Velocity",
    description: "Rotation couplets for mesocyclone hunting",
    kind: "tile",
    tileUrl: `${IEM_TILE}/ridge::USCOMP-N0S-0/{z}/{x}/{y}.png`,
    opacity: 0.78,
    maxNativeZoom: 12,
    legend: "velocity",
  },
  {
    id: "echotops",
    group: "Radar",
    label: "Echo Tops",
    description: "Storm height — taller cores are more severe",
    kind: "tile",
    tileUrl: `${IEM_TILE}/ridge::USCOMP-NET-0/{z}/{x}/{y}.png`,
    opacity: 0.75,
    maxNativeZoom: 12,
    legend: "tops",
  },
  {
    id: "precip",
    group: "Radar",
    label: "Precipitation",
    description: "1-hour precipitation accumulation",
    kind: "tile",
    tileUrl: `${IEM_TILE}/ridge::USCOMP-N1P-0/{z}/{x}/{y}.png`,
    opacity: 0.78,
    maxNativeZoom: 12,
    legend: "precip",
  },
  {
    id: "stormtotal",
    group: "Radar",
    label: "Storm Total Precip",
    description: "Storm-total rainfall mosaic",
    kind: "tile",
    tileUrl: `${IEM_TILE}/ridge::USCOMP-NTP-0/{z}/{x}/{y}.png`,
    opacity: 0.78,
    maxNativeZoom: 12,
    legend: "precip",
  },
  {
    id: "visible",
    group: "Satellite",
    label: "US Visible Satellite",
    description: "GOES-East GeoColor",
    kind: "tile",
    tileUrl:
      "https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/GOES-East_ABI_GeoColor/default/default/GoogleMapsCompatible_Level7/{z}/{y}/{x}.png",
    opacity: 0.92,
    maxNativeZoom: 7,
    legend: "sat",
  },
  {
    id: "infrared",
    group: "Satellite",
    label: "Infrared Satellite",
    description: "Cloud-top temperatures worldwide",
    kind: "rainviewer-satellite",
    opacity: 0.85,
    legend: "sat",
  },
  {
    id: "satellite",
    group: "Satellite",
    label: "Global Satellite",
    description: "Worldwide infrared satellite loop",
    kind: "rainviewer-satellite",
    opacity: 0.85,
    legend: "sat",
  },
  {
    id: "lightning",
    group: "Hazards",
    label: "Lightning",
    description: "Recent cloud-to-ground strikes and storm reports",
    kind: "geojson",
    source: "lightning",
    legend: "lightning",
  },
  {
    id: "alerts",
    group: "Hazards",
    label: "Alerts",
    description: "NWS watches and warnings",
    kind: "alerts",
    legend: "alerts",
  },
  {
    id: "storms",
    group: "Hazards",
    label: "Storm Tracker",
    description: "Active tropical cyclones from the National Hurricane Center",
    kind: "geojson",
    source: "nhc",
    legend: "storms",
  },
  {
    id: "severe",
    group: "Hazards",
    label: "Severe Storm Risk",
    description: "SPC Day-1 categorical convective outlook",
    kind: "geojson",
    source: "spc",
    legend: "spc",
  },
  {
    id: "fires",
    group: "Hazards",
    label: "Wildfires",
    description: "Current large-fire incidents",
    kind: "geojson",
    source: "fires",
    legend: "fires",
  },
  {
    id: "temperature",
    group: "Atmosphere",
    label: "Temperature",
    description: "Model temperature field",
    kind: "field",
    field: "temperature_2m",
    legend: "temp",
  },
  {
    id: "localtemp",
    group: "Atmosphere",
    label: "Local Temperature",
    description: "Denser local temperature sample",
    kind: "field",
    field: "temperature_2m",
    dense: true,
    legend: "temp",
  },
  {
    id: "heatindex",
    group: "Atmosphere",
    label: "Heat Index",
    description: "How hot it actually feels",
    kind: "field",
    field: "heat_index",
    legend: "temp",
  },
  {
    id: "windchill",
    group: "Atmosphere",
    label: "Wind Chill",
    description: "How cold it actually feels",
    kind: "field",
    field: "wind_chill",
    legend: "temp",
  },
  {
    id: "humidity",
    group: "Atmosphere",
    label: "Humidity",
    description: "Relative humidity",
    kind: "field",
    field: "relative_humidity_2m",
    legend: "humidity",
  },
  {
    id: "dewpoint",
    group: "Atmosphere",
    label: "Dew Point",
    description: "Atmospheric moisture",
    kind: "field",
    field: "dew_point_2m",
    legend: "temp",
  },
  {
    id: "pressure",
    group: "Atmosphere",
    label: "Pressure",
    description: "Mean sea-level pressure",
    kind: "field",
    field: "pressure_msl",
    legend: "pressure",
  },
  {
    id: "localpressure",
    group: "Atmosphere",
    label: "Local Pressure",
    description: "Denser local pressure sample",
    kind: "field",
    field: "pressure_msl",
    dense: true,
    legend: "pressure",
  },
  {
    id: "wind",
    group: "Atmosphere",
    label: "Wind Speed",
    description: "Sustained wind field",
    kind: "field",
    field: "wind_speed_10m",
    legend: "wind",
  },
  {
    id: "aqi",
    group: "Health",
    label: "Air Quality",
    description: "US AQI from the CAMS model",
    kind: "field",
    field: "us_aqi",
    endpoint: "air-quality",
    legend: "aqi",
  },
  {
    id: "pollen",
    group: "Health",
    label: "Pollen",
    description: "Grass, ragweed, and tree pollen",
    kind: "field",
    field: "pollen",
    endpoint: "air-quality",
    legend: "pollen",
  },
];

export function getMapLayer(id) {
  return MAP_LAYERS.find((layer) => layer.id === id) || MAP_LAYERS[0];
}

export const LEGENDS = {
  dbz: [
    { color: "#38bdf8", label: "Light" },
    { color: "#84cc16", label: "Mod" },
    { color: "#eab308", label: "Heavy" },
    { color: "#ef4444", label: "Severe" },
    { color: "#d946ef", label: "Extreme" },
  ],
  velocity: [
    { color: "#22c55e", label: "Inbound" },
    { color: "#f8fafc", label: "0" },
    { color: "#ef4444", label: "Outbound" },
  ],
  precip: [
    { color: "#bae6fd", label: "0.1\"" },
    { color: "#38bdf8", label: "0.5\"" },
    { color: "#6366f1", label: "1\"" },
    { color: "#a855f7", label: "2\"+" },
  ],
  temp: [
    { color: "#3b82f6", label: "Cold" },
    { color: "#22c55e", label: "Mild" },
    { color: "#eab308", label: "Warm" },
    { color: "#ef4444", label: "Hot" },
  ],
  humidity: [
    { color: "#fde68a", label: "Dry" },
    { color: "#38bdf8", label: "Moist" },
    { color: "#1d4ed8", label: "Saturated" },
  ],
  pressure: [
    { color: "#a855f7", label: "Low" },
    { color: "#94a3b8", label: "Avg" },
    { color: "#f97316", label: "High" },
  ],
  wind: [
    { color: "#86efac", label: "Calm" },
    { color: "#eab308", label: "Breezy" },
    { color: "#ef4444", label: "Strong" },
  ],
  aqi: [
    { color: "#22c55e", label: "Good" },
    { color: "#eab308", label: "Moderate" },
    { color: "#f97316", label: "USG" },
    { color: "#ef4444", label: "Unhealthy" },
  ],
  pollen: [
    { color: "#86efac", label: "Low" },
    { color: "#eab308", label: "Med" },
    { color: "#ef4444", label: "High" },
  ],
  lightning: [{ color: "#fde047", label: "Recent strike / storm report" }],
  storms: [{ color: "#fb7185", label: "Active tropical cyclone" }],
  fires: [{ color: "#f97316", label: "Active incident" }],
  spc: [
    { color: "#9ca3af", label: "TSTM" },
    { color: "#22c55e", label: "MRGL" },
    { color: "#eab308", label: "SLGT" },
    { color: "#f97316", label: "ENH" },
    { color: "#ef4444", label: "MDT" },
    { color: "#a855f7", label: "HIGH" },
  ],
  alerts: [
    { color: "#ef4444", label: "Tornado" },
    { color: "#f97316", label: "Severe" },
    { color: "#3b82f6", label: "Flood" },
    { color: "#a855f7", label: "Winter" },
  ],
  sat: [{ color: "#94a3b8", label: "Cloud / brightness" }],
  tops: [
    { color: "#38bdf8", label: "Low" },
    { color: "#eab308", label: "Mid" },
    { color: "#ef4444", label: "High" },
  ],
};

export function colorForField(field, value) {
  if (!Number.isFinite(value)) return "transparent";
  const lerp = (stops, t) => {
    const clamped = Math.max(0, Math.min(0.999, t));
    const idx = Math.floor(clamped * (stops.length - 1));
    return stops[idx];
  };

  if (field === "temperature_2m" || field === "dew_point_2m" || field === "heat_index" || field === "wind_chill") {
    return lerp(["#1e3a8a", "#3b82f6", "#22c55e", "#eab308", "#f97316", "#ef4444", "#9f1239"], (value + 10) / 120);
  }
  if (field === "relative_humidity_2m") {
    return lerp(["#fef3c7", "#67e8f9", "#0284c7", "#1e3a8a"], value / 100);
  }
  if (field === "pressure_msl") {
    return lerp(["#7c3aed", "#94a3b8", "#f97316"], (value - 980) / 50);
  }
  if (field === "wind_speed_10m") {
    return lerp(["#bbf7d0", "#eab308", "#ef4444", "#7f1d1d"], value / 50);
  }
  if (field === "us_aqi") {
    if (value <= 50) return "#22c55e";
    if (value <= 100) return "#eab308";
    if (value <= 150) return "#f97316";
    if (value <= 200) return "#ef4444";
    return "#7e22ce";
  }
  if (field === "pollen") {
    return lerp(["#bbf7d0", "#eab308", "#f97316", "#ef4444"], value / 150);
  }
  return "#38bdf8";
}
