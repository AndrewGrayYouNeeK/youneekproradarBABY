// Geolocation helper with timeout + sensible default (Columbia, KY)
export const DEFAULT_LOCATION = {
  latitude: 37.1023,
  longitude: -85.3061,
  label: "Columbia, KY",
};

export function getCurrentPosition({ timeout = 8000 } = {}) {
  return new Promise((resolve) => {
    if (!navigator.geolocation) return resolve(DEFAULT_LOCATION);
    const fallback = setTimeout(() => resolve(DEFAULT_LOCATION), timeout);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        clearTimeout(fallback);
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          label: null,
        });
      },
      () => {
        clearTimeout(fallback);
        resolve(DEFAULT_LOCATION);
      },
      { enableHighAccuracy: false, maximumAge: 60_000, timeout }
    );
  });
}

export function getStoredLocation() {
  try {
    const raw = localStorage.getItem("user_location_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Number.isFinite(parsed?.latitude) || !Number.isFinite(parsed?.longitude)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function setStoredLocation(loc) {
  if (!loc) return;
  localStorage.setItem("user_location_v1", JSON.stringify(loc));
}

export async function resolveLocation() {
  const stored = getStoredLocation();
  if (stored) return stored;
  const live = await getCurrentPosition();
  setStoredLocation(live);
  return live;
}