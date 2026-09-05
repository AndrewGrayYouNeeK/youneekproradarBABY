import { LoaderCircle } from "lucide-react";
import WeatherShell from "@/components/weather/WeatherShell";
import HourlyList from "@/components/forecast/HourlyList";
import WeatherKitSetupNotice from "@/components/forecast/WeatherKitSetupNotice";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useForecastWeather from "@/hooks/useForecastWeather";

export default function Hourly() {
  useTabPageMemory("Hourly");
  const { locationError, retry, showLoading, data, error, refetch } = useForecastWeather();

  return (
    <WeatherShell alerts={data?.alerts || []}>
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
      {!showLoading && error && (
        <div className="p-4">
          <WeatherKitSetupNotice type="error" message={error.message} onRetry={() => refetch()} />
        </div>
      )}
      {!showLoading && !locationError && !error && data && (
        <HourlyList hours={data.hourly} />
      )}
    </WeatherShell>
  );
}
