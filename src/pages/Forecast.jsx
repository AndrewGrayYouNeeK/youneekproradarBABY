import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import CurrentConditionsCard from "@/components/forecast/CurrentConditionsCard";
import HourlyStrip from "@/components/forecast/HourlyStrip";
import DailyList from "@/components/forecast/DailyList";
import StatCard from "@/components/ui/StatCard";
import ForecastDiscussion from "@/components/forecast/ForecastDiscussion";
import SPCOutlookCard from "@/components/forecast/SPCOutlookCard";
import HeatRiskCard from "@/components/forecast/HeatRiskCard";
import useLocation from "@/hooks/useLocation";
import { fetchCurrentConditions, fetchHourlyForecast, fetchDailyForecast, fetchAirQuality, degToCardinal } from "@/lib/weather/api";
import { Wind, Droplets, Sunrise, Sunset, Eye, Gauge, Sun, Activity } from "lucide-react";

export default function Forecast() {
  const { location, loading: locLoading } = useLocation();

  const { data: current } = useQuery({
    queryKey: ["currentConditions", location.latitude, location.longitude],
    queryFn: () => fetchCurrentConditions(location.latitude, location.longitude),
    enabled: !locLoading,
    staleTime: 5 * 60_000,
  });

  const { data: hourly } = useQuery({
    queryKey: ["hourly", location.latitude, location.longitude],
    queryFn: () => fetchHourlyForecast(location.latitude, location.longitude),
    enabled: !locLoading,
    staleTime: 10 * 60_000,
  });

  const { data: daily } = useQuery({
    queryKey: ["daily", location.latitude, location.longitude],
    queryFn: () => fetchDailyForecast(location.latitude, location.longitude),
    enabled: !locLoading,
    staleTime: 10 * 60_000,
  });

  const { data: aq } = useQuery({
    queryKey: ["aq", location.latitude, location.longitude],
    queryFn: () => fetchAirQuality(location.latitude, location.longitude),
    enabled: !locLoading,
    staleTime: 30 * 60_000,
  });

  const c = current?.current || {};
  const d = current?.daily || {};
  const aqi = aq?.current?.us_aqi;

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader
        title="Forecast"
        location={location.label || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
      />

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <CurrentConditionsCard data={current} location={location} />

        <SPCOutlookCard location={location} />

        <HeatRiskCard location={location} />

        <HourlyStrip hourly={hourly} />

        <DailyList daily={daily} />

        <ForecastDiscussion location={location} />

        <div className="grid grid-cols-2 gap-3">
          <StatCard icon={Wind} label="Wind" value={`${Math.round(c.wind_speed_10m ?? 0)} mph`} sub={`${degToCardinal(c.wind_direction_10m)} · gust ${Math.round(c.wind_gusts_10m ?? 0)}`} />
          <StatCard icon={Droplets} label="Humidity" value={`${Math.round(c.relative_humidity_2m ?? 0)}%`} sub={`Dew based`} />
          <StatCard icon={Gauge} label="Pressure" value={`${(c.pressure_msl ?? 0).toFixed(0)} hPa`} />
          <StatCard icon={Eye} label="Visibility" value={`${((c.visibility ?? 0) / 1609).toFixed(1)} mi`} />
          <StatCard icon={Sun} label="UV Index" value={`${(c.uv_index ?? 0).toFixed(1)}`} sub={uvLevel(c.uv_index)} />
          <StatCard icon={Activity} label="Air Quality" value={aqi != null ? aqi : "—"} sub={aqiLevel(aqi)} accent={aqiAccent(aqi)} />
          <StatCard icon={Sunrise} label="Sunrise" value={fmtTime(d.sunrise?.[0])} />
          <StatCard icon={Sunset} label="Sunset" value={fmtTime(d.sunset?.[0])} />
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function fmtTime(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
function uvLevel(uv) {
  if (uv == null) return "";
  if (uv < 3) return "Low";
  if (uv < 6) return "Moderate";
  if (uv < 8) return "High";
  if (uv < 11) return "Very High";
  return "Extreme";
}
function aqiLevel(a) {
  if (a == null) return "";
  if (a <= 50) return "Good";
  if (a <= 100) return "Moderate";
  if (a <= 150) return "Sensitive";
  if (a <= 200) return "Unhealthy";
  if (a <= 300) return "Very Unhealthy";
  return "Hazardous";
}
function aqiAccent(a) {
  if (a == null) return "text-muted-foreground";
  if (a <= 50) return "text-emerald-400";
  if (a <= 100) return "text-yellow-400";
  if (a <= 150) return "text-orange-400";
  return "text-red-400";
}