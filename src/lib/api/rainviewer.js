const CATALOG_URL = "https://api.rainviewer.com/public/weather-maps.json";

export async function fetchRainviewerCatalog() {
  const response = await fetch(CATALOG_URL);
  if (!response.ok) throw new Error("RainViewer catalog unavailable");
  return response.json();
}

export const fetchRainViewerCatalog = fetchRainviewerCatalog;

export function rainviewerFrames(catalog, kind = "radar") {
  if (kind === "satellite") {
    return catalog?.satellite?.infrared || [];
  }
  return [...(catalog?.radar?.past || []), ...(catalog?.radar?.nowcast || [])];
}

export const getRainViewerFrames = rainviewerFrames;

export function latestFrame(catalog, kind = "radar") {
  const frames = rainviewerFrames(catalog, kind);
  return frames[frames.length - 1] || null;
}

export function rainviewerTileUrl(host, path, zOrColor, x, y, options = "2/1_1") {
  if (x == null) {
    const color = zOrColor ?? 6;
    return `${host}${path}/256/{z}/{x}/{y}/${color}/1_1.png`;
  }
  return `${host}${path}/256/${zOrColor}/${x}/${y}/${options}.png`;
}

export async function stitchRainViewerTexture(host, path, { zoom = 2, color = 6 } = {}) {
  const { stitchMercatorTiles } = await import("@/lib/radar/equirectRadar");
  return stitchMercatorTiles(host, path, zoom, `${color}/1_1`);
}
