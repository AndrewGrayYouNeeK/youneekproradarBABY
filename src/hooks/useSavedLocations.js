import { useCallback, useMemo, useState } from "react";

const STORAGE_KEY = "saved_locations_v1";
const SELECTED_KEY = "pref_selectedLocation";

function readJson(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || "null");
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export default function useSavedLocations() {
  const [locations, setLocations] = useState(() => readJson(STORAGE_KEY, []));
  const [selected, setSelectedState] = useState(() => readJson(SELECTED_KEY, null));

  const persist = useCallback((next) => {
    setLocations(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const selectLocation = useCallback((location) => {
    setSelectedState(location);
    if (location) localStorage.setItem(SELECTED_KEY, JSON.stringify(location));
    else localStorage.removeItem(SELECTED_KEY);
  }, []);

  const addLocation = useCallback((location) => {
    const entry = {
      id: location.id || `${location.latitude},${location.longitude}`,
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
    };
    persist([entry, ...locations.filter((item) => item.id !== entry.id)].slice(0, 12));
    selectLocation(entry);
    return entry;
  }, [locations, persist, selectLocation]);

  const removeLocation = useCallback((id) => {
    persist(locations.filter((item) => item.id !== id));
    if (selected?.id === id) selectLocation(null);
  }, [locations, persist, selectLocation, selected]);

  const current = useMemo(() => selected, [selected]);

  return {
    locations,
    selected: current,
    selectLocation,
    addLocation,
    removeLocation,
    clearSelected: () => selectLocation(null),
  };
}
