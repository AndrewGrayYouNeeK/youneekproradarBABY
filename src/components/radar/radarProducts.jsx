const IEM = "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0";

export const IEM_FRAMES = [50, 45, 40, 35, 30, 25, 20, 15, 10, 5, 0];

export const RADAR_PRODUCTS = [
  {
    id: "reflectivity",
    label: "Reflectivity",
    group: "Radar",
    description: "NEXRAD base reflectivity",
    kind: "iem",
    layer: "ridge::USCOMP-N0Q-{frame}",
    opacity: 0.8,
    loop: true,
  },
  {
    id: "velocity",
    label: "Velocity",
    group: "Radar",
    description: "Base velocity mosaic",
    kind: "iem",
    layer: "ridge::USCOMP-N0U-{frame}",
    opacity: 0.75,
    loop: true,
  },
  {
    id: "storm-rel",
    label: "Storm-relative vel",
    group: "Radar",
    description: "Storm relative velocity",
    kind: "iem",
    layer: "ridge::USCOMP-N0S-{frame}",
    opacity: 0.75,
    loop: true,
  },
  {
    id: "composite",
    label: "Composite",
    group: "Radar",
    description: "Composite reflectivity",
    kind: "iem",
    layer: "ridge::USCOMP-NCR-0",
    opacity: 0.8,
    loop: false,
  },
  {
    id: "global",
    label: "Global radar",
    group: "Radar",
    description: "Worldwide RainViewer mosaic",
    kind: "rainviewer",
    opacity: 0.75,
    loop: true,
  },
  {
    id: "satellite-vis",
    label: "GOES visible",
    group: "Satellite",
    description: "GOES East visible",
    kind: "iem",
    layer: "goes_east_vis",
    opacity: 0.85,
    loop: false,
  },
  {
    id: "satellite-ir",
    label: "GOES infrared",
    group: "Satellite",
    description: "GOES East infrared",
    kind: "iem",
    layer: "goes_east_ir",
    opacity: 0.8,
    loop: false,
  },
  {
    id: "satellite-global",
    label: "Global IR",
    group: "Satellite",
    description: "RainViewer infrared satellite",
    kind: "rainviewer-sat",
    opacity: 0.85,
    loop: true,
  },
  {
    id: "truecolor",
    label: "True color",
    group: "Satellite",
    description: "NASA VIIRS true color",
    kind: "gibs",
    opacity: 1,
    loop: false,
  },
];

export const BASEMAPS = [
  {
    id: "dark",
    label: "Dark",
    url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
    attribution: "&copy; OpenStreetMap &copy; CARTO",
  },
  {
    id: "satellite",
    label: "Satellite",
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution: "Tiles &copy; Esri",
  },
  {
    id: "streets",
    label: "Streets",
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: "&copy; OpenStreetMap",
  },
];

export function getRadarProduct(productId) {
  return RADAR_PRODUCTS.find((product) => product.id === productId) || RADAR_PRODUCTS[0];
}

export function iemTileUrl(layer, frame = 0) {
  const resolved = layer.replace("{frame}", String(frame));
  return `${IEM}/${resolved}/{z}/{x}/{y}.png`;
}

export function gibsTrueColorUrl() {
  const date = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  return `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/VIIRS_SNPP_CorrectedReflectance_TrueColor/default/${date}/GoogleMapsCompatible_Level9/{z}/{y}/{x}.jpg`;
}
