// Local-storage saved locations registry.

const KEY = "saved_locations_v1";

export function getSavedLocations() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export function setSavedLocations(list) {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function addSavedLocation(loc) {
  const list = getSavedLocations();
  if (list.some((l) => l.label === loc.label)) return list;
  const next = [...list, { ...loc, id: Date.now().toString() }];
  setSavedLocations(next);
  return next;
}

export function removeSavedLocation(id) {
  const next = getSavedLocations().filter((l) => l.id !== id);
  setSavedLocations(next);
  return next;
}

// Open-Meteo geocoding (free, no key)
export async function searchLocations(query) {
  if (!query || query.length < 2) return [];
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.searchParams.set("name", query);
  url.searchParams.set("count", "8");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  const r = await fetch(url.toString());
  if (!r.ok) return [];
  const j = await r.json();
  return (j.results || []).map((res) => ({
    latitude: res.latitude,
    longitude: res.longitude,
    label: [res.name, res.admin1, res.country_code].filter(Boolean).join(", "),
  }));
}