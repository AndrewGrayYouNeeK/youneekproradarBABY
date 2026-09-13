export default function WeatherSourceBadge({ source, weatherkitError, weatherkitConfigured = true }) {
  if (source === "weatherkit") {
    return (
      <p className="text-[11px] text-white/80">
        Powered by <span className="font-semibold text-white">Apple Weather</span>
      </p>
    );
  }

  if (!weatherkitConfigured) {
    return (
      <p className="text-[11px] text-yellow-100">
        Apple WeatherKit is not configured — showing Open-Meteo. Add WEATHERKIT_* secrets to use your kit.
      </p>
    );
  }

  return (
      <p className="text-[11px] text-white/75">
      Using Open-Meteo
      {weatherkitError ? ` · WeatherKit: ${weatherkitError}` : ""}
    </p>
  );
}
