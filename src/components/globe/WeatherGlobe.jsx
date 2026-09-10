import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { fetchRainviewerCatalog, rainviewerFrames } from "@/lib/api/rainviewer";
import { buildRadarEquirectCanvas } from "@/lib/radar/equirectRadar";
import { fetchHurricanes, fetchLightningReports, fetchWildfires } from "@/lib/api/liveHazards";

const EARTH_DAY = "https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg";
const EARTH_NIGHT = "https://unpkg.com/three-globe/example/img/earth-night.jpg";
const EARTH_BUMP = "https://unpkg.com/three-globe/example/img/earth-topology.png";
const SKY = "https://unpkg.com/three-globe/example/img/night-sky.png";

function hurricaneColor(storm) {
  if (storm.classification === "HU") return "#fb7185";
  if (storm.classification === "TS") return "#fb923c";
  return "#facc15";
}

export default function WeatherGlobe({
  coords,
  layer = "radar",
  showStorms = true,
  showFires = true,
  showLightning = true,
  playing = true,
}) {
  const globeRef = useRef();
  const wrapRef = useRef();
  const textureRef = useRef(null);
  const [dims, setDims] = useState({ width: 0, height: 0 });
  const [frameIndex, setFrameIndex] = useState(0);
  const [overlayCanvas, setOverlayCanvas] = useState(null);
  const [ready, setReady] = useState(false);

  const { data: catalog } = useQuery({
    queryKey: ["rainviewer-catalog"],
    queryFn: fetchRainviewerCatalog,
    refetchInterval: 300000,
    staleTime: 60000,
  });

  const { data: storms = [] } = useQuery({
    queryKey: ["hurricanes"],
    queryFn: fetchHurricanes,
    refetchInterval: 300000,
    enabled: showStorms,
  });

  const { data: fires = [] } = useQuery({
    queryKey: ["wildfires"],
    queryFn: fetchWildfires,
    refetchInterval: 600000,
    enabled: showFires,
  });

  const { data: lightning = [] } = useQuery({
    queryKey: ["lightning-reports"],
    queryFn: fetchLightningReports,
    refetchInterval: 120000,
    enabled: showLightning,
  });

  const frames = useMemo(() => {
    if (!catalog) return [];
    return layer === "satellite" ? rainviewerFrames(catalog, "satellite") : rainviewerFrames(catalog, "radar");
  }, [catalog, layer]);

  const activeFrame = frames[Math.min(frameIndex, Math.max(frames.length - 1, 0))] || frames.at(-1);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return undefined;
    const update = () => setDims({ width: el.clientWidth, height: el.clientHeight });
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!playing || frames.length < 2) return undefined;
    const timer = setInterval(() => {
      setFrameIndex((index) => (index + 1) % frames.length);
    }, 700);
    return () => clearInterval(timer);
  }, [playing, frames.length]);

  useEffect(() => {
    if (frames.length) setFrameIndex(frames.length - 1);
  }, [catalog, layer, frames.length]);

  useEffect(() => {
    if (!catalog || !activeFrame) return undefined;
    let cancelled = false;
    const options = layer === "satellite" ? "0/0_0" : "2/1_1";
    buildRadarEquirectCanvas(catalog.host, activeFrame.path, options)
      .then((canvas) => {
        if (!cancelled) setOverlayCanvas(canvas);
      })
      .catch(() => {
        if (!cancelled) setOverlayCanvas(null);
      });
    return () => {
      cancelled = true;
    };
  }, [catalog, activeFrame, layer]);

  useEffect(() => {
    const globe = globeRef.current;
    if (!globe || !coords || !ready) return;
    globe.pointOfView(
      { lat: coords.latitude, lng: coords.longitude, altitude: 1.85 },
      1200
    );
  }, [coords, ready]);

  const points = useMemo(() => {
    const items = [];
    if (coords) {
      items.push({
        id: "you",
        lat: coords.latitude,
        lng: coords.longitude,
        color: "#38bdf8",
        radius: 0.45,
        altitude: 0.012,
        label: coords.label || "You",
      });
    }
    if (showStorms) {
      storms.forEach((storm) => {
        items.push({
          id: storm.id,
          lat: storm.lat,
          lng: storm.lng,
          color: hurricaneColor(storm),
          radius: 0.7,
          altitude: 0.02,
          label: `${storm.name} · ${storm.label} · ${storm.windKt} kt`,
        });
      });
    }
    if (showFires) {
      fires.slice(0, 40).forEach((fire) => {
        items.push({
          id: fire.id,
          lat: fire.lat,
          lng: fire.lng,
          color: "#f97316",
          radius: 0.28,
          altitude: 0.008,
          label: fire.title,
        });
      });
    }
    if (showLightning) {
      lightning.slice(0, 80).forEach((strike) => {
        items.push({
          id: strike.id,
          lat: strike.lat,
          lng: strike.lng,
          color: "#fde047",
          radius: 0.18,
          altitude: 0.006,
          label: `Lightning${strike.city ? ` near ${strike.city}` : ""}`,
        });
      });
    }
    return items;
  }, [coords, storms, fires, lightning, showStorms, showFires, showLightning]);

  const rings = useMemo(
    () =>
      showStorms
        ? storms.map((storm) => ({
            lat: storm.lat,
            lng: storm.lng,
            color: hurricaneColor(storm),
            maxR: storm.classification === "HU" ? 8 : 5,
          }))
        : [],
    [storms, showStorms]
  );

  const labels = useMemo(
    () =>
      showStorms
        ? storms.map((storm) => ({
            lat: storm.lat,
            lng: storm.lng,
            text: storm.name,
            color: hurricaneColor(storm),
          }))
        : [],
    [storms, showStorms]
  );

  const customLayerData = useMemo(
    () => (overlayCanvas ? [{ id: "radar-overlay", canvas: overlayCanvas }] : []),
    [overlayCanvas]
  );

  return (
    <div ref={wrapRef} className="absolute inset-0 bg-black">
      {dims.width > 0 && (
        <Globe
          ref={globeRef}
          width={dims.width}
          height={dims.height}
          backgroundImageUrl={SKY}
          globeImageUrl={layer === "night" ? EARTH_NIGHT : EARTH_DAY}
          bumpImageUrl={EARTH_BUMP}
          atmosphereColor="#7dd3fc"
          atmosphereAltitude={0.18}
          showAtmosphere
          animateIn={false}
          rendererConfig={{ antialias: true, alpha: false }}
          onGlobeReady={() => {
            setReady(true);
            const globe = globeRef.current;
            globe?.pointOfView(
              {
                lat: coords?.latitude ?? 25,
                lng: coords?.longitude ?? -90,
                altitude: 1.9,
              },
              0
            );
            const controls = globe?.controls?.();
            if (controls) {
              controls.autoRotate = true;
              controls.autoRotateSpeed = 0.35;
              controls.enableDamping = true;
              controls.minDistance = 140;
              controls.maxDistance = 500;
            }
          }}
          pointsData={points}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="radius"
          pointAltitude="altitude"
          pointLabel="label"
          ringsData={rings}
          ringLat="lat"
          ringLng="lng"
          ringColor={(d) => d.color}
          ringMaxRadius="maxR"
          ringPropagationSpeed={2.4}
          ringRepeatPeriod={900}
          labelsData={labels}
          labelLat="lat"
          labelLng="lng"
          labelText="text"
          labelColor="color"
          labelSize={1.4}
          labelDotRadius={0.25}
          labelAltitude={0.03}
          customLayerData={customLayerData}
          customThreeObject={() => {
            const geometry = new THREE.SphereGeometry(100.35, 96, 96);
            const material = new THREE.MeshBasicMaterial({
              transparent: true,
              opacity: 0.92,
              depthWrite: false,
              side: THREE.FrontSide,
            });
            return new THREE.Mesh(geometry, material);
          }}
          customThreeObjectUpdate={(obj, data) => {
            if (!data?.canvas) return;
            if (!textureRef.current) {
              textureRef.current = new THREE.CanvasTexture(data.canvas);
              textureRef.current.colorSpace = THREE.SRGBColorSpace;
              textureRef.current.needsUpdate = true;
              obj.material.map = textureRef.current;
              obj.material.needsUpdate = true;
              return;
            }
            textureRef.current.image = data.canvas;
            textureRef.current.needsUpdate = true;
          }}
        />
      )}
    </div>
  );
}
