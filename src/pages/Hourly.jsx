import { useQuery } from "@tanstack/react-query";
import { LoaderCircle } from "lucide-react";
import WeatherShell from "@/components/weather/WeatherShell";
import HourlyList from "@/components/forecast/HourlyList";
import WeatherKitSetupNotice from "@/components/forecast/WeatherKitSetupNotice";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchWeatherKit, WeatherKitNotConfiguredError } from "@/lib/api/weatherkit";
import { adaptWeatherKitHourly } from "@/lib/weather/weatherkit-adapters";

export default function Hourly() {
  useTabPageMemory("Hourly");
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
      {showLoading && (
        <div className="flex flex-1 items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin text-lime-300" aria-hidden="true" />
        </div>
      )}
      {!showLoading && locationError && (
        <div className="p-4">
          <WeatherKitSetupNotice type="location" message={locationError} onRetry={retry} />
        </div>
      )}
      {!showLoading && error instanceof WeatherKitNotConfiguredError && (
        <div className="p-4">
          <WeatherKitSetupNotice type="not-configured" message={error.hint} />
        </div>
      )}
      {!showLoading && error && !(error instanceof WeatherKitNotConfiguredError) && (
        <div className="p-4">
          <WeatherKitSetupNotice type="error" message={error.message} onRetry={() => refetch()} />
        </div>
      )}
      {!showLoading && !locationError && !error && data && (
        <HourlyList hours={adaptWeatherKitHourly(data)} />
      )}
    </WeatherShell>
  );
}
