import { useEffect, useState } from "react";
import { resolveLocation, DEFAULT_LOCATION, getStoredLocation } from "@/lib/weather/locationUtils";

export default function useLocation() {
  // Start with stored or default — never block render with `loading: true`.
  const [location, setLocation] = useState(() => getStoredLocation() || DEFAULT_LOCATION);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (getStoredLocation()) return; // already have a location, skip
    setLoading(true);
    let mounted = true;
    resolveLocation().then((loc) => {
      if (mounted) {
        setLocation(loc);
        setLoading(false);
      }
    });
    return () => { mounted = false; };
  }, []);

  return { location, loading, setLocation };
}