export default function WeatherSourceBadge({ source, weatherkitError, weatherkitConfigured = true }) {
  if (source === "weatherkit") {
    return (
      <p className="text-[11px] text-slate-500">
        Powered by <span className="font-semibold text-slate-300">Apple Weather</span>
      </p>
    );
  }

  if (!weatherkitConfigured) {
    return (
      <p className="text-[11px] text-amber-200/80">
        Apple WeatherKit is not configured — showing Open-Meteo. Add WEATHERKIT_* secrets to use your kit.
      </p>
    );
  }

  return (
    <p className="text-[11px] text-slate-500">
      Using Open-Meteo
      {weatherkitError ? ` · WeatherKit: ${weatherkitError}` : ""}
    </p>
  );
}
