import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import CurrentConditionsCard from "@/components/forecast/CurrentConditionsCard";
import DailyList from "@/components/forecast/DailyList";
import HourlyStrip from "@/components/forecast/HourlyStrip";
import MinutePrecipitation from "@/components/forecast/MinutePrecipitation";
import WeatherAlertsCard from "@/components/forecast/WeatherAlertsCard";
import WeatherKitSetupNotice from "@/components/forecast/WeatherKitSetupNotice";
import LifestyleCard from "@/components/forecast/LifestyleCard";
import AirQualityCard from "@/components/forecast/AirQualityCard";
import LightningCard from "@/components/forecast/LightningCard";
import WinterCard from "@/components/forecast/WinterCard";
import DayPartsCard from "@/components/forecast/DayPartsCard";
import AstronomyCard from "@/components/forecast/AstronomyCard";
import ComparisonCard from "@/components/forecast/ComparisonCard";
import WeatherKitAttribution from "@/components/forecast/WeatherKitAttribution";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchAirBundle, fetchForecastBundle } from "@/lib/api/forecastBundle";
import { adaptAirQuality } from "@/lib/api/openMeteo";
import { buildLifestyle, formatMoonPhase } from "@/lib/weather/lifestyle";
import { heatIndexF } from "@/lib/units";
import { useLightning } from "@/hooks/useLiveHazards";
import { haversineKm } from "@/lib/geo";

export default function Forecast() {
  useTabPageMemory("Forecast");
  const { coords, error: locationError, loading: locationLoading, retry } = useWeatherLocation();
  const { data: lightning } = useLightning();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["forecast-bundle", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    refetchInterval: 600000,
    queryFn: () => fetchForecastBundle(coords.latitude, coords.longitude),
  });

  const { data: airRaw } = useQuery({
    queryKey: ["air-bundle", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchAirBundle(coords.latitude, coords.longitude),
  });

  const air = airRaw ? adaptAirQuality(airRaw) : null;
  const lifestyle = useMemo(
    () => (data?.current ? buildLifestyle(data.current.current, data.hourly || [], air || {}) : []),
    [data, air]
  );

  const extras = useMemo(() => {
    const current = data?.current?.current || {};
    const today = data?.daily?.[0];
    return {
      uv: current.uv_index,
      moon: data?.astronomy?.moonPhaseLabel || formatMoonPhase(today?.moonPhase),
      heat: heatIndexF(current.temperature_2m, current.relative_humidity_2m),
      windMax: today?.windMax,
      windAvg: today?.windAvg,
    };
  }, [data]);

  const nearestLightningKm = useMemo(() => {
    if (!coords || !lightning?.features?.length) return null;
    let min = Infinity;
    lightning.features.forEach((feature) => {
      const coordsPair = feature.geometry?.coordinates;
      if (!Array.isArray(coordsPair) || coordsPair.length < 2) return;
      const [lon, lat] = coordsPair;
      const distance = haversineKm(coords.latitude, coords.longitude, lat, lon);
      if (distance < min) min = distance;
    });
    return Number.isFinite(min) ? min : null;
  }, [coords, lightning]);

  const showLoading = locationLoading || (Boolean(coords) && isLoading && !data);

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Forecast" />

      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-500">
              {data?.source === "open-meteo" ? "Open-Meteo + CAMS · all layers unlocked" : "Apple WeatherKit · all layers unlocked"}
            </p>
            {isFetching && !showLoading && (
              <span className="inline-flex items-center gap-1 text-[11px] text-slate-500">
                <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
                Updating
              </span>
            )}
          </div>

          {showLoading && (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-16">
              <LoaderCircle className="h-6 w-6 animate-spin text-sky-300" aria-hidden="true" />
            </div>
          )}

          {!showLoading && locationError && (
            <WeatherKitSetupNotice type="location" message={locationError} onRetry={retry} />
          )}

          {!showLoading && !locationError && error && (
            <WeatherKitSetupNotice type="error" message={error.message} onRetry={() => refetch()} />
          )}

          {!showLoading && !locationError && !error && data && (
            <>
              <WeatherAlertsCard alerts={data.alerts} detailsUrl={data.metadata?.alertDetailsUrl} />
              <LightningCard nearestKm={nearestLightningKm} reportCount={lightning?.features?.length || 0} />
              <CurrentConditionsCard data={data.current} extras={extras} />
              <ComparisonCard comparison={data.comparison} currentTemp={data.current?.current?.temperature_2m} />
              <DayPartsCard parts={data.dayParts} />
              <MinutePrecipitation minutes={data.minutes} summary={data.minuteSummary} />
              <LifestyleCard items={lifestyle} />
              <AirQualityCard air={air} />
              <HourlyStrip hours={data.hourly} />
              {data.recentHours?.length > 0 && (
                <HourlyStrip hours={data.recentHours} title="Past 24 hours" />
              )}
              <AstronomyCard astronomy={data.astronomy} />
              <WinterCard days={data.daily} />
              <DailyList days={data.daily} />
              {data.source === "weatherkit" && <WeatherKitAttribution metadata={data.metadata} />}
            </>
          )}
        </div>
      </div>

      <BottomTab />
    </div>
  );
}
