import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import WeatherShell from "@/components/weather/WeatherShell";
import DailyList from "@/components/forecast/DailyList";
import WeatherKitSetupNotice from "@/components/forecast/WeatherKitSetupNotice";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchWeatherKit, WeatherKitNotConfiguredError } from "@/lib/api/weatherkit";
import { adaptWeatherKitDaily } from "@/lib/weather/weatherkit-adapters";

export default function Daily() {
  useTabPageMemory("Daily");
  const { coords, error: locationError, loading: locationLoading, retry } = useWeatherLocation();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["weatherkit", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchWeatherKit(coords.latitude, coords.longitude),
  });

  const showLoading = locationLoading || (Boolean(coords) && isLoading && !data);

  return (
    <WeatherShell>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-md">
          {showLoading && (
            <div className="flex items-center justify-center py-16">
              <LoaderCircle className="h-6 w-6 animate-spin text-lime-300" aria-hidden="true" />
            </div>
          )}
          {!showLoading && locationError && (
            <WeatherKitSetupNotice type="location" message={locationError} onRetry={retry} />
          )}
          {!showLoading && error instanceof WeatherKitNotConfiguredError && (
            <WeatherKitSetupNotice type="not-configured" message={error.hint} />
          )}
          {!showLoading && error && !(error instanceof WeatherKitNotConfiguredError) && (
            <WeatherKitSetupNotice type="error" message={error.message} onRetry={() => refetch()} />
          )}
          {!showLoading && !locationError && !error && data && (
            <DailyList days={adaptWeatherKitDaily(data)} />
          )}
        </div>
      </div>
    </WeatherShell>
  );
}
