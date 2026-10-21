import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchOpenMeteoForecast } from "@/lib/api/openMeteoForecast";
import { YNK222_WEATHER_URL } from "@/lib/landing/radarApp";
import { parseIpLocation, pickVisitorConditions, skyFromCurrent } from "@/lib/landing/visitorWeather";
import { adaptWeatherKitCurrent } from "@/lib/weather/weatherkit-adapters";

async function fetchYnk222Current(lat, lon) {
  const url = `${YNK222_WEATHER_URL}?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}`;
  const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
  if (!response.ok) return null;
  const data = await response.json();
  return adaptWeatherKitCurrent(data)?.current || null;
}

function within(promise, ms) {
  return Promise.race([
    promise,
    new Promise((resolve) => {
      setTimeout(() => resolve(null), ms);
    }),
  ]);
}

async function loadVisitorConditions(lat, lon) {
  const meteoPromise = fetchOpenMeteoForecast(lat, lon)
    .then((bundle) => bundle?.current?.current || null)
    .catch(() => null);
  // YNK222 /api/weather is WeatherKit-quality when the browser allows it.
  // A missing CORS header must not hold up the free forecast.
  const ynkPromise = fetchYnk222Current(lat, lon).catch(() => null);
  const [meteo, ynk] = await Promise.all([meteoPromise, within(ynkPromise, 1200)]);
  return pickVisitorConditions(ynk, meteo);
}

export default function useVisitorWeather() {
  const gps = useWeatherLocation();
  const [ipPlace, setIpPlace] = useState(null);
  const [ipSettled, setIpSettled] = useState(false);

  useEffect(() => {
    if (gps.loading || gps.coords) return undefined;
    let cancelled = false;
    (async () => {
      try {
        const response = await fetch("https://get.geojs.io/v1/ip/geo.json");
        if (!response.ok) throw new Error("IP location unavailable");
        const parsed = parseIpLocation(await response.json());
        if (!cancelled) setIpPlace(parsed);
      } catch {
        if (!cancelled) setIpPlace(null);
      } finally {
        if (!cancelled) setIpSettled(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gps.loading, gps.coords]);

  const place = gps.coords
    ? {
        latitude: gps.coords.latitude,
        longitude: gps.coords.longitude,
        label: "Your location",
        source: "gps",
      }
    : ipPlace;

  const query = useQuery({
    queryKey: ["visitor-weather", place?.latitude, place?.longitude],
    enabled: Boolean(place),
    staleTime: 300000,
    queryFn: () => loadVisitorConditions(place.latitude, place.longitude),
  });

  const picked = query.data || null;
  const current = picked?.current || null;
  const waitingForPlace = gps.loading || (!gps.coords && !ipSettled);
  const loading = waitingForPlace || (Boolean(place) && query.isLoading && !current);

  return {
    place,
    current,
    sky: skyFromCurrent(current),
    weatherSource: picked?.source || "",
    loading,
    usingFallback: !loading && !current,
  };
}
