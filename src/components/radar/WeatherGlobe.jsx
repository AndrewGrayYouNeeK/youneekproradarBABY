import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { stitchRainViewerTexture } from "@/lib/api/rainviewer";

const EARTH_RADIUS = 1.6;
const NIGHT_TEXTURE =
  "https://cdn.jsdelivr.net/npm/three-globe@2.31.1/example/img/earth-night.jpg";

function latLonToVector3(lat, lon, radius) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lon + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

function createStarfield() {
  const geometry = new THREE.BufferGeometry();
  const count = 1400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    const r = 18 + Math.random() * 20;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({ color: 0xb8d4ff, size: 0.035, sizeAttenuation: true });
  return new THREE.Points(geometry, material);
}

function createAtmosphere() {
  const material = new THREE.ShaderMaterial({
    side: THREE.BackSide,
    transparent: true,
    depthWrite: false,
    uniforms: {},
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 6.0);
        gl_FragColor = vec4(0.35, 0.72, 1.0, 1.0) * intensity;
      }
    `,
  });
  return new THREE.Mesh(new THREE.SphereGeometry(EARTH_RADIUS * 1.08, 64, 64), material);
}

function createRadarMaterial(texture) {
  return new THREE.ShaderMaterial({
    uniforms: {
      radarTex: { value: texture },
      opacity: { value: 0.92 },
    },
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      varying vec3 vPos;
      void main() {
        vPos = normalize(position);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D radarTex;
      uniform float opacity;
      varying vec3 vPos;
      void main() {
        float lat = asin(clamp(vPos.y, -1.0, 1.0));
        float lon = atan(vPos.z, vPos.x);
        float mercN = log(max(0.000001, tan(0.785398163 + lat * 0.5)));
        vec2 uv = vec2(lon / 6.28318530718 + 0.5, 0.5 - mercN / 6.28318530718);
        if (uv.y < 0.0 || uv.y > 1.0) discard;
        vec4 color = texture2D(radarTex, uv);
        float luma = color.r + color.g + color.b;
        if (luma < 0.12 && color.a < 0.08) discard;
        gl_FragColor = vec4(color.rgb * 1.15, max(color.a, luma * 0.55) * opacity);
      }
    `,
  });
}

export default function WeatherGlobe({
  catalog,
  frame,
  userLocation,
  storms = [],
  center,
}) {
  const mountRef = useRef(null);
  const threeRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return undefined;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020617);
    const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 80);
    camera.position.set(0, 0.4, 5.1);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enablePan = false;
    controls.minDistance = 2.3;
    controls.maxDistance = 9;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.35;
    controls.addEventListener("start", () => {
      controls.autoRotate = false;
    });

    const group = new THREE.Group();
    scene.add(group);
    scene.add(new THREE.AmbientLight(0x9bb7ff, 0.85));
    const sun = new THREE.DirectionalLight(0xffffff, 1.35);
    sun.position.set(5, 2, 3);
    scene.add(sun);
    scene.add(createStarfield());
    scene.add(createAtmosphere());

    const earth = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS, 96, 96),
      new THREE.MeshPhongMaterial({ color: 0x1e3a5f, shininess: 8, emissive: 0x0a1a2f })
    );
    group.add(earth);

    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      NIGHT_TEXTURE,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        earth.material = new THREE.MeshPhongMaterial({
          map: texture,
          shininess: 12,
          specular: new THREE.Color(0x223344),
        });
        earth.material.needsUpdate = true;
      },
      undefined,
      () => {}
    );

    const radarMesh = new THREE.Mesh(
      new THREE.SphereGeometry(EARTH_RADIUS * 1.01, 96, 96),
      createRadarMaterial(new THREE.CanvasTexture(document.createElement("canvas")))
    );
    group.add(radarMesh);

    const markers = new THREE.Group();
    group.add(markers);

    const clock = new THREE.Clock();
    let frameId = 0;
    let disposed = false;

    const resize = () => {
      if (!mount) return;
      const width = mount.clientWidth || 1;
      const height = mount.clientHeight || 1;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(mount);

    const animate = () => {
      if (disposed) return;
      controls.update();
      const t = clock.getElapsedTime();
      markers.children.forEach((child) => {
        if (child.userData.pulse) {
          const scale = 1 + Math.sin(t * 3) * 0.18;
          child.scale.set(scale, scale, scale);
        }
      });
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate();

    threeRef.current = { scene, camera, renderer, controls, group, earth, radarMesh, markers, loader };

    return () => {
      disposed = true;
      cancelAnimationFrame(frameId);
      observer.disconnect();
      controls.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      threeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const api = threeRef.current;
    if (!api || !center) return;
    const target = latLonToVector3(center.lat, center.lng, 1);
    api.controls.autoRotate = false;
    api.camera.position.copy(target.multiplyScalar(3.2));
    api.camera.lookAt(0, 0, 0);
    api.controls.update();
  }, [center?.lat, center?.lng]);

  useEffect(() => {
    const api = threeRef.current;
    if (!api?.markers) return;
    while (api.markers.children.length) {
      const child = api.markers.children[0];
      api.markers.remove(child);
      child.geometry?.dispose?.();
      child.material?.dispose?.();
    }

    if (userLocation) {
      const pin = new THREE.Mesh(
        new THREE.SphereGeometry(0.035, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0x38bdf8 })
      );
      pin.position.copy(latLonToVector3(userLocation.lat, userLocation.lon, EARTH_RADIUS * 1.02));
      pin.userData.pulse = true;
      api.markers.add(pin);
    }

    storms.forEach((storm) => {
      if (storm.latitudeNumeric == null || storm.longitudeNumeric == null) return;
      const cyclone = new THREE.Mesh(
        new THREE.SphereGeometry(0.045, 16, 16),
        new THREE.MeshBasicMaterial({ color: 0xfb7185 })
      );
      cyclone.position.copy(
        latLonToVector3(storm.latitudeNumeric, storm.longitudeNumeric, EARTH_RADIUS * 1.03)
      );
      api.markers.add(cyclone);
    });
  }, [userLocation, storms]);

  useEffect(() => {
    const api = threeRef.current;
    if (!api || !catalog || !frame?.path) return undefined;
    let cancelled = false;

    stitchRainViewerTexture(catalog.host, frame.path, { zoom: 2, color: 6 })
      .then((canvas) => {
        if (cancelled || !threeRef.current) return;
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.needsUpdate = true;
        const previous = api.radarMesh.material.uniforms.radarTex.value;
        api.radarMesh.material.uniforms.radarTex.value = texture;
        api.radarMesh.material.needsUpdate = true;
        previous?.dispose?.();
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [catalog, frame?.path]);

  return (
    <div className="absolute inset-0 bg-slate-950">
      <div ref={mountRef} className="h-full w-full" role="img" aria-label="3D weather radar globe" />
      <div className="pointer-events-none absolute left-3 top-3 rounded-full border border-cyan-400/30 bg-slate-950/70 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
        3D Globe
      </div>
      <div className="pointer-events-none absolute bottom-3 left-3 right-3 text-center text-[11px] text-slate-400">
        Drag to rotate · pinch or scroll to zoom · radar wraps the planet
      </div>
    </div>
  );
}
