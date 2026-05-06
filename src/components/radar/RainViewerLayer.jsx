import { useEffect, useState } from "react";
import { TileLayer } from "react-leaflet";

// RainViewer global precipitation radar — free, no API key.
// Docs: https://www.rainviewer.com/api.html
const RV_INDEX = "https://api.rainviewer.com/public/weather-maps.json";

export default function RainViewerLayer({ opacity = 0.7 }) {
  const [host, setHost] = useState(null);
  const [path, setPath] = useState(null);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      try {
        const res = await fetch(RV_INDEX);
        const json = await res.json();
        const frames = json?.radar?.past || [];
        const latest = frames[frames.length - 1];
        if (alive && latest) {
          setHost(json.host);
          setPath(latest.path);
        }
      } catch {
        // silently fail — NEXRAD remains visible
      }
    };
    load();
    const t = setInterval(load, 5 * 60_000); // refresh every 5 min
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!host || !path) return null;

  // Color scheme 4 = Universal Blue, 1 = smooth, 1 = snow on
  const url = `${host}${path}/256/{z}/{x}/{y}/4/1_1.png`;

  return (
    <TileLayer
      key={path}
      url={url}
      opacity={opacity}
      attribution="© RainViewer"
      zIndex={350}
    />
  );
}