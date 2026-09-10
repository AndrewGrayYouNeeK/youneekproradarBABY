import { useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchForecastBundle, fetchAirBundle } from "@/lib/api/forecastBundle";
import { adaptAirQuality } from "@/lib/api/openMeteo";
import { fetchRainAlert } from "@/lib/api/rainAlert";
import { useLightning, useNhcStorms } from "@/hooks/useLiveHazards";
import { haversineKm } from "@/lib/geo";

function pref(key, fallback = true) {
  const value = localStorage.getItem(key);
  if (value == null) return fallback;
  return value !== "false";
}

function notifyOnce(id, title, body) {
  const stampKey = `notify_sent_${id}`;
  const last = Number(sessionStorage.getItem(stampKey) || 0);
  if (Date.now() - last < 30 * 60 * 1000) return;
  sessionStorage.setItem(stampKey, String(Date.now()));
  try {
    new Notification(title, { body, silent: false });
  } catch {
    // notifications optional
  }
}

export default function useWeatherWatchdog() {
  const { coords } = useWeatherLocation();
  const { data: lightning } = useLightning();
  const { data: storms } = useNhcStorms();
  const lastRun = useRef(0);

  const { data: forecast } = useQuery({
    queryKey: ["forecast-bundle", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchForecastBundle(coords.latitude, coords.longitude),
  });

  const { data: airRaw } = useQuery({
    queryKey: ["air-bundle", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchAirBundle(coords.latitude, coords.longitude),
  });

  const { data: rain } = useQuery({
    queryKey: ["rainArrivalAlert", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    refetchInterval: 120000,
    queryFn: () => fetchRainAlert(coords),
  });

  useEffect(() => {
    if (!coords || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    if (Date.now() - lastRun.current < 60 * 1000) return;
    lastRun.current = Date.now();

    const air = airRaw ? adaptAirQuality(airRaw) : null;

    if (pref("pref_notifyRain") && (rain?.status === "rain_soon" || rain?.status === "rain_now")) {
      notifyOnce("rain", "Rain arriving", rain.status === "rain_now" ? "Rain is starting now." : `Rain likely in about ${rain.minutesUntilRain} minutes.`);
    }

    if (pref("pref_notifyDailyPrecip", false) && (forecast?.hourly?.[0]?.pop || 0) >= 60) {
      notifyOnce("daily-precip", "Precipitation expected", "There's a high chance of rain or snow in the next few hours.");
    }

    if (pref("pref_notifyPollen", false) && (air?.pollen || 0) >= 50) {
      notifyOnce("pollen", "Pollen is elevated", "Allergy conditions are running medium or high.");
    }

    if (pref("pref_notifyAqi", false) && (air?.aqi || 0) >= 100) {
      notifyOnce("aqi", "Air quality alert", `US AQI is ${Math.round(air.aqi)}.`);
    }

    if (pref("pref_notifyLightning", false) && lightning?.features?.length) {
      const near = lightning.features.some((feature) => {
        const pair = feature.geometry?.coordinates;
        if (!pair) return false;
        return haversineKm(coords.latitude, coords.longitude, pair[1], pair[0]) <= 25;
      });
      if (near) notifyOnce("lightning", "Lightning nearby", "Lightning reports are within about 15 miles.");
    }

    if (pref("pref_notifyHurricane", false) && storms?.activeStorms?.length) {
      const near = storms.activeStorms.some((storm) =>
        haversineKm(coords.latitude, coords.longitude, storm.latitudeNumeric, storm.longitudeNumeric) <= 800
      );
      if (near) notifyOnce("hurricane", "Tropical cyclone nearby", "An active NHC storm is within range of your region.");
    }

    if (pref("pref_notifyStormRisk", false) && (forecast?.current?.current?.cape || 0) > 1500) {
      notifyOnce("cape", "Severe storm risk", "Instability is elevated in the latest model data.");
    }
  }, [coords, rain, forecast, airRaw, lightning, storms]);
}
