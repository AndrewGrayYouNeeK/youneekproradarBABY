import { LoaderCircle } from "lucide-react";
import WeatherShell from "@/components/weather/WeatherShell";
import NowHero from "@/components/forecast/NowHero";
import HourlyStrip from "@/components/forecast/HourlyStrip";
import EnvironmentCards from "@/components/forecast/EnvironmentCards";
import MinutePrecipitation from "@/components/forecast/MinutePrecipitation";
import WeatherAlertsCard from "@/components/forecast/WeatherAlertsCard";
import WeatherKitSetupNotice from "@/components/forecast/WeatherKitSetupNotice";
import DailyList from "@/components/forecast/DailyList";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useForecastWeather from "@/hooks/useForecastWeather";
import { fetchEnvironment } from "@/lib/api/environment";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

export default function Forecast() {
  useTabPageMemory("Forecast");
  const navigate = useNavigate();
  const {
    coords,
    locationError,
    retry,
    showLoading,
    data,
    error,
    isFetching,
    refetch,
  } = useForecastWeather();

  const { data: environment } = useQuery({
    queryKey: ["environment", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    queryFn: () => fetchEnvironment(coords),
  });

  const alerts = data?.alerts || [];

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

          {!showLoading && !locationError && error && (
            <WeatherKitSetupNotice
              type="error"
              message={error.message}
              onRetry={() => refetch()}
            />
          )}

          {!showLoading && !locationError && !error && data && (
            <>
              <WeatherAlertsCard alerts={alerts} />
              <NowHero
                data={data.current}
                source={data.source}
                weatherkitError={data.weatherkitError}
                weatherkitConfigured={data.weatherkitConfigured}
              />
              <HourlyStrip hours={data.hourly?.slice(0, 24)} />
              <MinutePrecipitation minutes={data.nextHour} />
              <EnvironmentCards data={environment} />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                    10 Day
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate("/Daily")}
                    className="text-[11px] font-semibold text-lime-300"
                  >
                    See all
                  </button>
                </div>
                <DailyList days={data.daily?.slice(0, 5)} />
              </div>
            </>
          )}
        </div>
      </div>
    </WeatherShell>
  );
}
