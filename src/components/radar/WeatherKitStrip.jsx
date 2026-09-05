import { useQuery } from "@tanstack/react-query";
import { ChevronRight, LoaderCircle, Wind } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { fetchForecastBundle } from "@/lib/api/forecast";
import { describeWeatherCode } from "@/lib/weather/conditions";
import useWeatherLocation from "@/hooks/useWeatherLocation";

const CARDINAL_DIRS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];

function degreesToCardinal(deg) {
  if (deg === null || deg === undefined || Number.isNaN(deg)) return "";
  return CARDINAL_DIRS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
}

export default function WeatherKitStrip({ windData }) {
  const navigate = useNavigate();
  const { coords, loading: locationLoading } = useWeatherLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["forecast-bundle", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 300000,
    refetchInterval: 600000,
    queryFn: () => fetchForecastBundle(coords.latitude, coords.longitude),
  });

  const cardClass =
    "pointer-events-auto max-w-[16.75rem] rounded-2xl border border-white/10 bg-[#10151c]/92 px-3 py-2 text-left shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl";

  if (locationLoading || (isLoading && coords)) {
    return (
      <div className={cardClass}>
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
          Loading conditions…
        </div>
      </div>
    );
  }

  const current = data?.current?.current;
  if (!current) {
    if (windData) {
      const cardinal = degreesToCardinal(windData.directionDeg);
      const speedLabel = windData.speedMph != null ? `${Math.round(windData.speedMph)} mph` : "--";
      return (
        <div className={cardClass}>
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <Wind className="h-3.5 w-3.5 text-lime-400" aria-hidden="true" />
            Wind
          </div>
          <div className="mt-0.5 text-sm font-bold text-white">
            {speedLabel} {cardinal}
          </div>
        </div>
      );
    }
    return null;
  }

  const nextHour = data.hourly?.[0];
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;
  const cardinal = windData ? degreesToCardinal(windData.directionDeg) : "";
  const windLabel = windData?.speedMph != null
    ? `${Math.round(windData.speedMph)} mph ${cardinal}`.trim()
    : null;

  return (
    <button type="button" onClick={() => navigate("/Forecast")} className={cardClass}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-lime-400/15 text-lime-300">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <div className="flex items-baseline gap-1.5">
            <span className="text-[22px] font-bold leading-none tabular-nums text-white">
              {Math.round(current.temperature_2m ?? 0)}°
            </span>
            <span className="truncate text-xs text-slate-300">
              {current.condition_label || code.label}
            </span>
          </div>
          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-400">
            {windLabel && <span>{windLabel}</span>}
            {windLabel && nextHour && <span className="text-white/20">·</span>}
            {nextHour && <span>{nextHour.pop}% rain</span>}
            <ChevronRight className="ml-auto h-3.5 w-3.5 shrink-0 text-lime-400" aria-hidden="true" />
          </div>
        </div>
      </div>
    </button>
  );
}
