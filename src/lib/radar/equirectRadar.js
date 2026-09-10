import { rainviewerTileUrl } from "@/lib/api/rainviewer";

function latToMercatorY(lat, size) {
  const clamped = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const sin = Math.sin((clamped * Math.PI) / 180);
  return (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * size;
}

function loadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error(`Tile failed: ${url}`));
    image.src = url;
  });
}

export async function stitchMercatorTiles(host, path, z = 2, options = "2/1_1") {
  const count = 2 ** z;
  const tileSize = 256;
  const canvas = document.createElement("canvas");
  canvas.width = count * tileSize;
  canvas.height = count * tileSize;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  const tasks = [];
  for (let y = 0; y < count; y += 1) {
    for (let x = 0; x < count; x += 1) {
      tasks.push(
        loadImage(rainviewerTileUrl(host, path, z, x, y, options))
          .then((image) => ctx.drawImage(image, x * tileSize, y * tileSize))
          .catch(() => {})
      );
    }
  }

  await Promise.all(tasks);
  return canvas;
}

export function mercatorToEquirect(mercCanvas, width = 1024, height = 512) {
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  const src = mercCanvas.getContext("2d").getImageData(0, 0, mercCanvas.width, mercCanvas.height);
  const dst = ctx.createImageData(width, height);
  const mw = mercCanvas.width;
  const mh = mercCanvas.height;

  for (let y = 0; y < height; y += 1) {
    const lat = 90 - (y / Math.max(height - 1, 1)) * 180;
    if (Math.abs(lat) > 85.05112878) continue;
    const mercY = latToMercatorY(lat, mh);
    for (let x = 0; x < width; x += 1) {
      const mercX = (x / width) * mw;
      const sx = Math.min(mw - 1, Math.max(0, mercX | 0));
      const sy = Math.min(mh - 1, Math.max(0, mercY | 0));
      const si = (sy * mw + sx) * 4;
      const di = (y * width + x) * 4;
      dst.data[di] = src.data[si];
      dst.data[di + 1] = src.data[si + 1];
      dst.data[di + 2] = src.data[si + 2];
      dst.data[di + 3] = src.data[si + 3];
    }
  }

  ctx.putImageData(dst, 0, 0);
  return out;
}

export async function buildRadarEquirectCanvas(host, path, options = "2/1_1") {
  const mosaic = await stitchMercatorTiles(host, path, 2, options);
  return mercatorToEquirect(mosaic);
}
