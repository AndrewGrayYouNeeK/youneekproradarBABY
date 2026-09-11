import { useCallback, useEffect, useState } from "react";
import { readCachedGps, writeCachedGps } from "@/lib/locationCache";

function movedEnough(prev, next) {
  if (!prev) return true;
  const dLat = (next.latitude - prev.latitude) * 111.32;
  const dLon = (next.longitude - prev.longitude) * 111.32 * Math.cos((next.latitude * Math.PI) / 180);
  return Math.hypot(dLat, dLon) > 0.08;
}

export default function useWeatherLocation() {
  const [coords, setCoords] = useState(() => readCachedGps());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(() => !readCachedGps());

  const requestLocation = useCallback(() => {
    setLoading(!readCachedGps());
    setError("");

    if (!navigator.geolocation) {
      if (!readCachedGps()) {
        setError("Location services are not available on this device.");
      }
      setLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        writeCachedGps(next);
        setCoords((prev) => (movedEnough(prev, next) ? next : prev));
        setLoading(false);
      },
      () => {
        if (!readCachedGps()) {
          setError("Allow location access to load forecasts for your area.");
        }
        setLoading(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { coords, error, loading, retry: requestLocation };
}
