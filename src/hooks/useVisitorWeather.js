import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchOpenMeteoForecast } from "@/lib/api/openMeteoForecast";
import { upcomingDays, upcomingHours } from "@/lib/landing/briefing";
import { fetchActiveAlerts, fetchAlertOutlines, fetchNwsPlace } from "@/lib/landing/nws";
import { parseIpLocation, skyFromCurrent } from "@/lib/landing/visitorWeather";

export default function useVisitorWeather() {
  const gps = useWeatherLocation();
  const [chosen, setChosen] = useState(null);
  const [ipPlace, setIpPlace] = useState(null);
  const [ipSettled, setIpSettled] = useState(false);
  const [areaName, setAreaName] = useState("");
  const [pointZones, setPointZones] = useState([]);

  useEffect(() => {
    if (gps.loading || gps.coords || chosen) return undefined;
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
  }, [gps.loading, gps.coords, chosen]);

  const gpsPlace = gps.coords
    ? { latitude: gps.coords.latitude, longitude: gps.coords.longitude, label: "Your location", source: "gps" }
    : null;
  const place = chosen || gpsPlace || ipPlace;

  const forecast = useQuery({
    queryKey: ["visitor-forecast", place?.latitude, place?.longitude],
    enabled: Boolean(place),
    staleTime: 300000,
    queryFn: () => fetchOpenMeteoForecast(place.latitude, place.longitude),
  });

  const alerts = useQuery({
    queryKey: ["visitor-alerts", place?.latitude, place?.longitude],
    enabled: Boolean(place),
    staleTime: 120000,
    queryFn: () => fetchActiveAlerts(place.latitude, place.longitude),
  });

  const latitude = place?.latitude;
  const longitude = place?.longitude;

  useEffect(() => {
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return undefined;
    let cancelled = false;
    setAreaName("");
    setPointZones([]);
    fetchNwsPlace(latitude, longitude)
      .then((meta) => {
        if (!cancelled) {
          setAreaName(meta?.label || "");
          setPointZones(meta?.zones || []);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAreaName("");
          setPointZones([]);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  const alertList = alerts.data || [];
  const alertKey = alertList.map((alert) => alert.id).join("|");
  const outlines = useQuery({
    queryKey: ["visitor-outlines", alertKey, pointZones.join("|")],
    enabled: alertList.length > 0,
    staleTime: 120000,
    queryFn: () => fetchAlertOutlines(alertList, pointZones),
  });

  const current = forecast.data?.current?.current || null;
  const waitingForPlace = !chosen && (gps.loading || (!gps.coords && !ipSettled));
  const loading = waitingForPlace || (Boolean(place) && forecast.isLoading && !current);
  const placeLabel = chosen?.label || areaName || place?.label || (loading ? "Finding you…" : "Location unavailable");

  return {
    place,
    placeLabel,
    locationNote: !chosen && !gps.coords && gps.error ? gps.error : "",
    choosePlace: (next) => setChosen({ ...next, source: "search" }),
    useMyLocation: () => {
      setChosen(null);
      gps.retry();
    },
    current,
    hourly: upcomingHours(forecast.data?.hourly),
    daily: upcomingDays(forecast.data?.daily),
    alerts: alertList,
    outlines: outlines.data || [],
    alertsState: alerts.isError ? "error" : alerts.isSuccess ? "ready" : "loading",
    sky: skyFromCurrent(current),
    weatherSource: current ? "open-meteo" : "",
    loading,
    forecastError: forecast.isError,
    refetchForecast: forecast.refetch,
    usingFallback: !loading && !current,
  };
}
