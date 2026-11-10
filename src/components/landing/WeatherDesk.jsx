import { describeWeatherCode, formatDayLabel, formatHourTime } from "@/lib/weather/conditions";
import { formatWind } from "@/lib/landing/briefing";
import LocationSearch from "@/components/landing/LocationSearch";

function round(value) {
  return Number.isFinite(Number(value)) ? Math.round(Number(value)) : "—";
}

function placeCaption(source) {
  if (source === "gps") return "Using the location you allowed.";
  if (source === "ip") return "Approximate location from your network, not a GPS fix.";
  if (source === "search") return "Showing the city you searched.";
  return "";
}

export default function WeatherDesk({
  placeLabel,
  placeSource = "",
  hasPlace = true,
  current,
  hourly,
  daily,
  loading,
  forecastError,
  onRetry,
  daylight,
  locationNote,
  onSelectPlace,
  onUseMine,
}) {
  const code = describeWeatherCode(current?.weather_code, daylight !== false);
  const Icon = code.icon;
  const condition = current?.condition_label || code.label;

  return (
    <div className="mt-5 space-y-4">
      <div className="text-sm text-white/80">{placeLabel}</div>
      {placeCaption(placeSource) ? <p className="text-xs text-white/70">{placeCaption(placeSource)}</p> : null}
      <LocationSearch onSelect={onSelectPlace} onUseMine={onUseMine} locationNote={locationNote} />

      {!hasPlace && !loading ? (
        <p className="border border-white/15 bg-black/75 p-4 text-sm leading-relaxed text-white/85">
          No sample city is loaded. Allow location or search for a city to see conditions and a short forecast.
        </p>
      ) : (
      <div className="border border-white/15 bg-black/75 p-4 backdrop-blur-md">
        {forecastError ? (
          <div className="space-y-2 text-sm">
            <p>Forecast is unavailable right now.</p>
            <button type="button" onClick={onRetry} className="text-xs uppercase tracking-[0.16em] text-[#00ff9c]">
              Retry
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-5xl font-light tabular-nums">{loading ? "…" : `${round(current?.temperature_2m)}°`}</div>
                <div className="mt-1 text-sm text-white/80">
                  Feels like {loading || !current ? "—" : `${round(current.apparent_temperature)}°`}
                </div>
                <div className="mt-1 text-base">{loading ? "Reading the sky…" : condition}</div>
              </div>
              <Icon className="h-14 w-14 shrink-0 text-[#00ff9c]" strokeWidth={1.4} aria-hidden="true" />
            </div>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-white/50">Wind</dt>
                <dd>{loading ? "—" : formatWind(current)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-[0.16em] text-white/50">Humidity</dt>
                <dd>{loading || current?.relative_humidity_2m == null ? "—" : `${round(current.relative_humidity_2m)}%`}</dd>
              </div>
            </dl>
          </>
        )}
      </div>
      )}

      {hasPlace || loading ? (
      <>
      <section aria-label="Hourly forecast">
        <h3 className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#00ff9c]">Next hours</h3>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {hourly.map((hour) => {
            const hourCode = describeWeatherCode(hour.weather_code, daylight !== false);
            const HourIcon = hourCode.icon;
            return (
              <div key={hour.time} className="min-w-[4.5rem] border border-white/15 bg-black/70 px-2 py-2 text-center">
                <div className="text-[10px] text-white/60">{formatHourTime(hour.time)}</div>
                <HourIcon className="mx-auto my-1 h-4 w-4 text-[#00ff9c]" aria-hidden="true" />
                <div className="text-sm tabular-nums">{hour.temperature}°</div>
                <div className="text-[10px] text-white/50">{hour.pop}%</div>
              </div>
            );
          })}
        </div>
      </section>

      <section aria-label="Daily forecast">
        <h3 className="mb-2 text-[10px] uppercase tracking-[0.28em] text-[#00ff9c]">Next 5 days</h3>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {daily.map((day) => {
            const dayCode = describeWeatherCode(day.weather_code);
            const DayIcon = dayCode.icon;
            return (
              <div key={day.date} className="border border-white/15 bg-black/70 px-2 py-2">
                <div className="text-[10px] text-white/60">{formatDayLabel(day.date)}</div>
                <div className="mt-1 flex items-center gap-1">
                  <DayIcon className="h-4 w-4 text-[#00ff9c]" aria-hidden="true" />
                  <span className="text-sm tabular-nums">{day.high}°</span>
                  <span className="text-xs text-white/50 tabular-nums">{day.low}°</span>
                </div>
                <div className="text-[10px] text-white/50">{day.label} · {day.pop}%</div>
              </div>
            );
          })}
        </div>
      </section>
      </>
      ) : null}
    </div>
  );
}
