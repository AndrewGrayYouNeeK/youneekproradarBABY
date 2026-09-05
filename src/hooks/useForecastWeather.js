import { useQuery } from "@tanstack/react-query";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchForecastBundle } from "@/lib/api/forecast";

export default function useForecastWeather() {
  const { coords, error: locationError, loading: locationLoading, retry } = useWeatherLocation();

  const query = useQuery({
    queryKey: ["forecast-bundle", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    refetchInterval: 600000,
    queryFn: () => fetchForecastBundle(coords.latitude, coords.longitude),
  });

  const showLoading = (!coords && locationLoading) || (Boolean(coords) && query.isLoading && !query.data);

  return {
    coords,
    locationError: coords ? "" : locationError,
    retry,
    showLoading,
    data: query.data,
    error: query.error,
    isFetching: query.isFetching,
    refetch: query.refetch,
  };
}
