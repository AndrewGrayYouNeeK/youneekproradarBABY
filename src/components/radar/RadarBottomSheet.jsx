import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { ChevronUp, ChevronDown, Wind, Droplets, Gauge, Eye, Sun, Activity, AlertTriangle, MapPin, X, CloudSun } from "lucide-react";
import {
  fetchCurrentConditions,
  fetchHourlyForecast,
  fetchDailyForecast,
  fetchAirQuality,
  fetchActiveAlerts,
  alertSeverity,
  describeWeatherCode,
  degToCardinal,
} from "@/lib/weather/api";

// Three snap points (% of viewport height): peek, half, full
const SNAP = { peek: 18, half: 55, full: 88 };

export default function RadarBottomSheet({ location }) {
  const [snap, setSnap] = useState("peek");
  const [hidden, setHidden] = useState(false);

  const { data: current } = useQuery({
    queryKey: ["currentConditions", location.latitude, location.longitude],
    queryFn: () => fetchCurrentConditions(location.latitude, location.longitude),
    staleTime: 5 * 60_000,
  });
  const { data: hourly } = useQuery({
    queryKey: ["hourly", location.latitude, location.longitude],
    queryFn: () => fetchHourlyForecast(location.latitude, location.longitude),
    staleTime: 10 * 60_000,
  });
  const { data: daily } = useQuery({
    queryKey: ["daily", location.latitude, location.longitude],
    queryFn: () => fetchDailyForecast(location.latitude, location.longitude),
    staleTime: 10 * 60_000,
  });
  const { data: aq } = useQuery({
    queryKey: ["aq", location.latitude, location.longitude],
    queryFn: () => fetchAirQuality(location.latitude, location.longitude),
    staleTime: 30 * 60_000,
  });
  const { data: alertData } = useQuery({
    queryKey: ["alerts", location.latitude, location.longitude],
    queryFn: () => fetchActiveAlerts(location.latitude, location.longitude),
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
  });

  const c = current?.current || {};
  const d = current?.daily || {};
  const code = describeWeatherCode(c.weather_code);
  const tempF = Math.round(c.temperature_2m ?? 0);
  const feelsF = Math.round(c.apparent_temperature ?? 0);
  const hi = Math.round(d.temperature_2m_max?.[0] ?? 0);
  const lo = Math.round(d.temperature_2m_min?.[0] ?? 0);
  const aqi = aq?.current?.us_aqi;

  const alerts = (alertData?.features || [])
    .slice()
    .sort((a, b) => alertSeverity(b.properties?.event).priority - alertSeverity(a.properties?.event).priority);

  // Drag → choose closest snap
  const handleDragEnd = (_, info) => {
    const vh = window.innerHeight;
    const offsetVh = (-info.offset.y / vh) * 100;
    const velocity = info.velocity.y;
    const order = ["peek", "half", "full"];
    let i = order.indexOf(snap);

    if (velocity < -300) i = Math.min(2, i + 1);
    else if (velocity > 300) i = Math.max(0, i - 1);
    else if (offsetVh > 15) i = Math.min(2, i + 1);
    else if (offsetVh < -15) i = Math.max(0, i - 1);

    setSnap(order[i]);
  };

  const cycleSnap = () => {
    setSnap(snap === "peek" ? "half" : snap === "half" ? "full" : "peek");
  };

  const heightVh = SNAP[snap];

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        aria-label="Show forecast"
        className="absolute bottom-20 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-primary/50 bg-primary/90 px-4 py-2 text-xs font-bold uppercase tracking-wider text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary"
        style={{ minHeight: "auto" }}
      >
        <CloudSun className="h-4 w-4" />
        Forecast
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <motion.div
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.05}
      onDragEnd={handleDragEnd}
      animate={{ height: `${heightVh}vh` }}
      transition={{ type: "spring", damping: 30, stiffness: 280 }}
      className="absolute bottom-16 left-0 right-0 z-30 mx-auto max-w-md overflow-hidden rounded-t-3xl border-t border-border/60 glass-strong shadow-2xl"
      style={{ touchAction: "none" }}
    >
      {/* Drag handle + close */}
      <div className="relative">
        <button
          onClick={cycleSnap}
          className="flex w-full flex-col items-center gap-1 px-4 py-2"
          aria-label="Expand or collapse"
        >
          <div className="h-1 w-10 rounded-full bg-border" />
          {snap === "peek" ? (
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); setHidden(true); }}
          aria-label="Hide forecast"
          className="absolute right-2 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-border/60 bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
          style={{ minHeight: "auto" }}
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Always-visible peek summary */}
      <div className="px-4 pb-2">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{location.label || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}</span>
            </div>
            <div className="mt-0.5 flex items-baseline gap-2">
              <span className="text-3xl font-black leading-none">{tempF}°</span>
              <span className="text-sm text-muted-foreground">{code.label}</span>
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Feels {feelsF}° · H {hi}° L {lo}°
            </div>
          </div>
          {alerts.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-red-500/40 bg-red-950/40 px-2.5 py-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-400" />
              <span className="text-[11px] font-bold text-red-200">{alerts.length}</span>
            </div>
          )}
        </div>
      </div>

      {/* Scrollable expanded content */}
      <AnimatePresence>
        {snap !== "peek" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-y-auto px-4 pb-6"
            style={{ maxHeight: `calc(${heightVh}vh - 110px)`, touchAction: "auto" }}
          >
            {/* Active alerts */}
            {alerts.length > 0 && (
              <div className="mb-4 space-y-2">
                <SectionLabel>Active Alerts</SectionLabel>
                {alerts.slice(0, 3).map((a) => {
                  const sev = alertSeverity(a.properties?.event);
                  return (
                    <div
                      key={a.id || a.properties?.id}
                      className={`rounded-xl border p-2.5 ${
                        sev.priority >= 4 ? "border-red-500/40 bg-red-950/40" :
                        sev.priority >= 3 ? "border-orange-500/40 bg-orange-950/40" :
                        "border-yellow-500/40 bg-yellow-950/30"
                      }`}
                    >
                      <div className="text-xs font-bold">{a.properties?.event}</div>
                      <div className="truncate text-[11px] text-muted-foreground">{a.properties?.areaDesc}</div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Hourly */}
            {hourly?.properties?.periods && (
              <div className="mb-4">
                <SectionLabel>Next 12 Hours</SectionLabel>
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                  {hourly.properties.periods.slice(0, 12).map((h) => (
                    <div key={h.number} className="flex min-w-[58px] flex-col items-center rounded-xl border border-border/60 bg-card/60 px-2 py-2.5">
                      <div className="text-[10px] font-semibold uppercase text-muted-foreground">
                        {new Date(h.startTime).toLocaleTimeString([], { hour: "numeric" })}
                      </div>
                      <div className="my-1 text-base font-bold">{h.temperature}°</div>
                      <div className="text-[10px] text-cyan-400 tabular-nums">
                        {h.probabilityOfPrecipitation?.value ?? 0}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Daily */}
            {daily?.properties?.periods && (
              <div className="mb-4">
                <SectionLabel>7-Day Forecast</SectionLabel>
                <div className="space-y-1.5">
                  {pairDays(daily.properties.periods).slice(0, 7).map((day, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 px-3 py-2">
                      <div className="w-16 text-xs font-semibold">{i === 0 ? "Today" : day.name.slice(0, 3)}</div>
                      <div className="flex-1 truncate text-[11px] text-muted-foreground">{day.short}</div>
                      <div className="text-[10px] text-cyan-400 tabular-nums">{day.pop}%</div>
                      <div className="w-16 text-right text-xs tabular-nums">
                        <span className="font-bold">{day.high}°</span>
                        <span className="text-muted-foreground"> {day.low}°</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Stats grid */}
            <div className="mb-4">
              <SectionLabel>Conditions</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                <Stat icon={Wind} label="Wind" value={`${Math.round(c.wind_speed_10m ?? 0)} mph`} sub={degToCardinal(c.wind_direction_10m)} />
                <Stat icon={Droplets} label="Humidity" value={`${Math.round(c.relative_humidity_2m ?? 0)}%`} />
                <Stat icon={Gauge} label="Pressure" value={`${(c.pressure_msl ?? 0).toFixed(0)} hPa`} />
                <Stat icon={Eye} label="Visibility" value={`${((c.visibility ?? 0) / 1609).toFixed(1)} mi`} />
                <Stat icon={Sun} label="UV" value={`${(c.uv_index ?? 0).toFixed(1)}`} />
                <Stat icon={Activity} label="AQI" value={aqi != null ? `${aqi}` : "—"} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function SectionLabel({ children }) {
  return (
    <div className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
      {children}
    </div>
  );
}

function Stat({ icon: Icon, label, value, sub }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-2.5">
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3 w-3 text-primary" />
        {label}
      </div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function pairDays(periods) {
  const out = [];
  for (let i = 0; i < periods.length; i++) {
    const p = periods[i];
    if (p.isDaytime) {
      const night = periods[i + 1];
      out.push({
        name: p.name,
        short: p.shortForecast,
        high: p.temperature,
        low: night?.temperature ?? p.temperature,
        pop: p.probabilityOfPrecipitation?.value ?? 0,
      });
      if (night) i++;
    } else if (out.length === 0) {
      // Tonight first
      out.push({
        name: p.name,
        short: p.shortForecast,
        high: p.temperature,
        low: p.temperature,
        pop: p.probabilityOfPrecipitation?.value ?? 0,
      });
    }
  }
  return out;
}