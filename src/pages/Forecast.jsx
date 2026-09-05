import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import WeatherShell from "@/components/weather/WeatherShell";
import NowHero from "@/components/forecast/NowHero";
import EnvironmentCards from "@/components/forecast/EnvironmentCards";
import MinutePrecipitation from "@/components/forecast/MinutePrecipitation";
import WeatherAlertsCard from "@/components/forecast/WeatherAlertsCard";
import WeatherKitSetupNotice from "@/components/forecast/WeatherKitSetupNotice";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchWeatherKit, WeatherKitNotConfiguredError } from "@/lib/api/weatherkit";
import { fetchEnvironment } from "@/lib/api/environment";
import {
  adaptWeatherKitAlerts,
  adaptWeatherKitCurrent,
  adaptWeatherKitNextHour,
} from "@/lib/weather/weatherkit-adapters";

export default function Forecast() {
  useTabPageMemory("Forecast");
  const { coords, error: locationError, loading: locationLoading, retry } = useWeatherLocation();

  const {
    data,
    isLoading,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["weatherkit", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    refetchInterval: 600000,
    queryFn: () => fetchWeatherKit(coords.latitude, coords.longitude),
  });

  const { data: environment } = useQuery({
    queryKey: ["environment", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchEnvironment(coords),
  });

  const showLoading = locationLoading || (Boolean(coords) && isLoading && !data);
  const alerts = data ? adaptWeatherKitAlerts(data) : [];

  return (
    <WeatherShell alerts={alerts}>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-md flex-col gap-4">
          {isFetching && !showLoading && (
            <div className="flex items-center gap-1 text-[11px] text-slate-500">
              <LoaderCircle className="h-3 w-3 animate-spin" aria-hidden="true" />
              Updating
            </div>
          )}

          {showLoading && (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/5 py-16">
              <LoaderCircle className="h-6 w-6 animate-spin text-lime-300" aria-hidden="true" />
            </div>
          )}

          {!showLoading && locationError && (
            <WeatherKitSetupNotice type="location" message={locationError} onRetry={retry} />
          )}

          {!showLoading && !locationError && error instanceof WeatherKitNotConfiguredError && (
            <WeatherKitSetupNotice type="not-configured" message={error.hint} />
          )}

          {!showLoading && !locationError && error && !(error instanceof WeatherKitNotConfiguredError) && (
            <WeatherKitSetupNotice
              type="error"
              message={error.message}
              onRetry={() => refetch()}
            />
          )}

          {!showLoading && !locationError && !error && data && (
            <>
              <WeatherAlertsCard alerts={alerts} />
              <NowHero data={adaptWeatherKitCurrent(data)} />
              <MinutePrecipitation minutes={adaptWeatherKitNextHour(data)} />
              <EnvironmentCards data={environment} />
            </>
          )}
        </div>
      </div>
    </WeatherShell>
  );
}
