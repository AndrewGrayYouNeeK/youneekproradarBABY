import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, ChevronDown, MapPin, Settings } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { RadioMiniButton, SafetyActionBar } from "@/components/weather/SafetyActionBar";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import { fetchForecastBundle } from "@/lib/api/forecast";
import { reverseGeocode } from "@/lib/locationCache";

const TABS = [
  { label: "NOW", path: "/Forecast" },
  { label: "HOURLY", path: "/Hourly" },
  { label: "10 DAY", path: "/Daily" },
  { label: "MAPS", path: "/Radar" },
  { label: "RADIO", path: "/Radio" },
];

function isActive(pathname, path) {
  if (path === "/Forecast") return pathname === "/Forecast";
  return pathname.startsWith(path);
}

export default function WeatherShell({ children, variant = "page", alerts: alertsProp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { coords } = useWeatherLocation();
  const overlay = variant === "map";

  const { data: placeName } = useQuery({
    queryKey: ["placeName", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords),
    staleTime: 36e5,
    queryFn: () => reverseGeocode(coords),
  });

  const { data: forecast } = useQuery({
    queryKey: ["forecast-bundle", coords?.latitude, coords?.longitude],
    enabled: Boolean(coords) && alertsProp == null,
    staleTime: 300000,
    queryFn: () => fetchForecastBundle(coords.latitude, coords.longitude),
  });

  const alerts = alertsProp ?? forecast?.alerts ?? [];
  const alertCount = alerts.length;

  return (
    <div
      className={`flex h-[100dvh] flex-col overflow-hidden ${overlay ? "bg-[#0a0d12]" : "bg-[#07101c]"}`}
      style={overlay ? { "--weather-chrome-top": "8.85rem" } : undefined}
    >
      <header
        className={`z-[1700] shrink-0 ${overlay ? "absolute inset-x-0 top-0 bg-gradient-to-b from-[#07101c] via-[#07101c]/92 to-transparent" : "bg-[#07101c]"}`}
        style={{ paddingTop: "env(safe-area-inset-top)" }}
      >
        <div className="flex items-center gap-2 px-3 py-2">
          <button
            type="button"
            onClick={() => navigate("/Settings")}
            className="flex min-h-0 min-w-0 items-center gap-1.5 text-left"
            aria-label="Open settings"
          >
            <MapPin className="h-4 w-4 shrink-0 text-lime-400" aria-hidden="true" />
            <div className="min-w-0">
              <div className="flex items-center gap-1 text-[15px] font-semibold text-white">
                <span className="truncate">{placeName || "My location"}</span>
                <ChevronDown className="h-4 w-4 shrink-0 text-lime-400" aria-hidden="true" />
              </div>
            </div>
          </button>
          <div className="ml-auto flex items-center gap-1.5">
            <RadioMiniButton />
            <button
              type="button"
              onClick={() => navigate("/Forecast")}
              aria-label={alertCount ? `${alertCount} weather alerts` : "Weather alerts"}
              className="relative flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-full"
            >
              <AlertTriangle className={`h-5 w-5 ${alertCount ? "text-red-500" : "text-slate-500"}`} aria-hidden="true" />
              {alertCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
                  {alertCount > 9 ? "9+" : alertCount}
                </span>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/Settings")}
              aria-label="Open settings"
              className="flex h-9 w-9 min-h-9 min-w-9 items-center justify-center rounded-full text-slate-300"
            >
              <Settings className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        <nav className="flex items-center justify-between px-2 pb-1">
          {TABS.map((tab) => {
            const active = isActive(location.pathname, tab.path);
            return (
              <button
                key={tab.path}
                type="button"
                onClick={() => navigate(tab.path)}
                className={`relative min-h-10 flex-1 px-1 pb-2 text-[12px] font-bold tracking-[0.04em] ${
                  active ? "text-white" : "text-slate-400"
                }`}
              >
                {tab.label}
                {active && <span className="absolute inset-x-3 bottom-0 h-[3px] rounded-full bg-white" />}
              </button>
            );
          })}
        </nav>
        {overlay && (
          <div className="px-3 pb-2">
            <SafetyActionBar compact />
          </div>
        )}
      </header>

      <div className={`min-h-0 flex-1 ${overlay ? "relative" : "flex flex-col overflow-hidden"}`}>
        {children}
      </div>

      {!overlay && <SafetyActionBar />}
    </div>
  );
}
