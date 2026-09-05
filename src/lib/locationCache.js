const GPS_KEY = "lastGps_v1";

export function readCachedGps() {
  try {
    const parsed = JSON.parse(localStorage.getItem(GPS_KEY) || "null");
    if (parsed?.latitude && parsed?.longitude) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function writeCachedGps(coords) {
  if (!coords?.latitude || !coords?.longitude) return;
  localStorage.setItem(
    GPS_KEY,
    JSON.stringify({
      latitude: coords.latitude,
      longitude: coords.longitude,
      savedAt: Date.now(),
    })
  );
}

export function mapsLink(coords) {
  if (!coords?.latitude || !coords?.longitude) return "";
  return `https://maps.google.com/?q=${coords.latitude},${coords.longitude}`;
}

export async function reverseGeocode(coords) {
  if (!coords?.latitude || !coords?.longitude) return "";
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${coords.latitude}&longitude=${coords.longitude}&localityLanguage=en`;
  const response = await fetch(url);
  if (!response.ok) return "";
  const data = await response.json();
  const city = data.city || data.locality || data.principalSubdivision || "";
  const region = data.principalSubdivisionCode?.replace(/^[A-Z]+-/, "") || data.principalSubdivision || "";
  if (city && region && city !== region) return `${city}, ${region}`;
  return city || region || "My location";
}
