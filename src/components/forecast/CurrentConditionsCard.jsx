import { describeWeatherCode, degToCardinal, formatPrecipType } from "@/lib/weather/conditions";
import { formatPrecip, formatPressure, formatTemp, formatVisibility, formatWind } from "@/lib/units";
import { useUnits } from "@/lib/UnitsContext";

export default function CurrentConditionsCard({ data, extras = {} }) {
  if (!data) return null;

  const { units } = useUnits();
  const current = data.current || {};
  const daily = data.daily || {};
  const code = describeWeatherCode(current.weather_code);
  const Icon = code.icon;
  const vis = formatVisibility(current.visibility_mi, units.distance);
  const trend = current.pressure_trend
    ? String(current.pressure_trend).replace(/([A-Z])/g, " $1").trim()
    : "";
  const precipType = formatPrecipType(current.precip_type);
  const hasCloudLayers =
    current.cloud_cover_low != null || current.cloud_cover_mid != null || current.cloud_cover_high != null;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-6">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
            Current Conditions
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-6xl font-extralight leading-none tabular-nums text-white">
              {formatTemp(current.temperature_2m, units.temp).replace("°", "")}°
            </span>
            <span className="text-base text-slate-400">{units.temp}</span>
          </div>
          <div className="mt-1 text-sm text-slate-200">{current.condition_label || code.label}</div>
          <div className="text-xs text-slate-400">
            Feels like {formatTemp(current.apparent_temperature, units.temp)}
            {current.daylight === false ? " · Night" : ""}
            {precipType ? ` · ${precipType}` : ""}
          </div>
        </div>
        <Icon className="h-20 w-20 text-sky-300/80" strokeWidth={1.4} aria-hidden="true" />
      </div>

      <div className="relative mt-5 grid grid-cols-2 gap-3 text-xs sm:grid-cols-3">
        <Stat label="High" value={formatTemp(daily.temperature_2m_max?.[0], units.temp)} />
        <Stat label="Low" value={formatTemp(daily.temperature_2m_min?.[0], units.temp)} />
        <Stat
          label="Wind"
          value={`${formatWind(current.wind_speed_10m, units.wind)} ${degToCardinal(current.wind_direction_10m)}`}
        />
        <Stat
          label="Gusts"
          value={current.wind_gusts_10m != null ? formatWind(current.wind_gusts_10m, units.wind) : "—"}
        />
        <Stat
          label="Wind max"
          value={extras.windMax != null ? formatWind(extras.windMax, units.wind) : "—"}
        />
        <Stat
          label="Wind avg"
          value={extras.windAvg != null ? formatWind(extras.windAvg, units.wind) : "—"}
        />
        <Stat label="Humidity" value={`${Math.round(current.relative_humidity_2m ?? 0)}%`} />
        <Stat label="Dew point" value={current.dew_point != null ? formatTemp(current.dew_point, units.temp) : "—"} />
        <Stat label="UV" value={extras.uv != null ? String(extras.uv) : current.uv_index != null ? String(current.uv_index) : "—"} />
        <Stat label="Visibility" value={vis} />
        <Stat
          label="Pressure"
          value={
            current.pressure_msl != null
              ? `${formatPressure(current.pressure_msl, units.pressure)}${trend ? ` ${trend}` : ""}`
              : "—"
          }
        />
        <Stat label="Clouds" value={current.cloud_cover != null ? `${current.cloud_cover}%` : "—"} />
        <Stat
          label="Precip rate"
          value={
            current.precipitation_intensity != null
              ? `${formatPrecip(current.precipitation_intensity, units.precip)}/hr`
              : "—"
          }
        />
        <Stat label="Precip type" value={precipType || "None"} />
        <Stat
          label="Sun"
          value={
            daily.sunrise?.[0] && daily.sunset?.[0]
              ? `${new Date(daily.sunrise[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}–${new Date(daily.sunset[0]).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
              : "—"
          }
        />
        <Stat label="Moon" value={extras.moon || "—"} />
        <Stat label="Heat index" value={extras.heat != null ? formatTemp(extras.heat, units.temp) : "—"} />
      </div>

      {hasCloudLayers && (
        <div className="relative mt-4 rounded-2xl border border-white/5 bg-white/5 px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">Cloud layers</div>
          <div className="mt-2 space-y-2">
            <CloudLayer label="High" value={current.cloud_cover_high} />
            <CloudLayer label="Mid" value={current.cloud_cover_mid} />
            <CloudLayer label="Low" value={current.cloud_cover_low} />
          </div>
        </div>
      )}
    </div>
  );
}

function CloudLayer({ label, value }) {
  const pct = Number.isFinite(Number(value)) ? Math.max(0, Math.min(100, Number(value))) : 0;
  return (
    <div className="flex items-center gap-3">
      <div className="w-10 text-[11px] text-slate-400">{label}</div>
      <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full rounded-full bg-sky-300/80" style={{ width: `${pct}%` }} />
      </div>
      <div className="w-8 text-right text-[11px] tabular-nums text-white">{Number.isFinite(Number(value)) ? `${Math.round(Number(value))}%` : "—"}</div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">{label}</div>
      <div className="mt-1 font-medium text-white">{value}</div>
    </div>
  );
}
