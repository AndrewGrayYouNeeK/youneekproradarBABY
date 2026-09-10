import { useCallback, useEffect, useState } from "react";
import useSavedLocations from "@/hooks/useSavedLocations";

export default function useWeatherLocation() {
  const { selected, selectLocation, addLocation, locations, removeLocation, clearSelected } = useSavedLocations();
  const [gps, setGps] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      if (!selected) setError("Location services are not available on this device.");
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGps({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLoading(false);
      },
      () => {
        if (!selected) {
          setError("Allow location access or search for a city to load forecasts.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, [selected]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const coords = selected
    ? { latitude: selected.latitude, longitude: selected.longitude, label: selected.name, source: "saved" }
    : gps
      ? { latitude: gps.latitude, longitude: gps.longitude, label: "Current location", source: "gps" }
      : null;

  return {
    coords,
    gps,
    error: coords ? "" : error,
    loading: loading && !coords,
    retry: requestLocation,
    selected,
    selectLocation,
    addLocation,
    removeLocation,
    clearSelected,
    locations,
  };
}
