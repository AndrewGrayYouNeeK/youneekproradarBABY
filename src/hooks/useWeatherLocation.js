import { useCallback, useEffect, useState } from "react";
import { readCachedGps, writeCachedGps } from "@/lib/locationCache";

export default function useWeatherLocation() {
  const [coords, setCoords] = useState(() => readCachedGps());
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const requestLocation = useCallback(() => {
    setLoading(true);
    setError("");

    if (!navigator.geolocation) {
      setError("Location services are not available on this device.");
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
        setCoords(next);
        setLoading(false);
      },
      () => {
        setError("Allow location access to load WeatherKit forecasts for your area.");
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  return { coords, error, loading, retry: requestLocation };
}
