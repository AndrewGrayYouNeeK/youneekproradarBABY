import { useEffect, useState } from "react";
import { resolveLocation, DEFAULT_LOCATION } from "@/lib/weather/locationUtils";

export default function useLocation() {
  const [location, setLocation] = useState(DEFAULT_LOCATION);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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