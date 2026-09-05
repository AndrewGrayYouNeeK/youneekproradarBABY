import { LoaderCircle } from "lucide-react";
import WeatherShell from "@/components/weather/WeatherShell";
import DailyList from "@/components/forecast/DailyList";
import WeatherKitSetupNotice from "@/components/forecast/WeatherKitSetupNotice";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useForecastWeather from "@/hooks/useForecastWeather";

export default function Daily() {
  useTabPageMemory("Daily");
  const { locationError, retry, showLoading, data, error, refetch } = useForecastWeather();

  return (
    <WeatherShell alerts={data?.alerts || []}>
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
          {!showLoading && error && (
            <WeatherKitSetupNotice type="error" message={error.message} onRetry={() => refetch()} />
          )}
          {!showLoading && !locationError && !error && data && (
            <DailyList days={data.daily} />
          )}
        </div>
      </div>
    </WeatherShell>
  );
}
