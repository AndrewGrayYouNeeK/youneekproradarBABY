/**
 * WeatherBug-style live sky: gradient + sun/moon, clouds, rain, snow, fog, lightning.
 * CSS-only so the NOW homepage stays light on phones.
 */
function particles(count, seed) {
  return Array.from({ length: count }, (_, i) => {
    const n = (i * 17 + seed * 13) % 100;
    return {
      key: `${seed}-${i}`,
      left: `${(i * 7.3 + n * 0.11) % 100}%`,
      delay: `${((i * 0.17) % 2.4).toFixed(2)}s`,
      duration: `${(0.7 + (i % 9) * 0.11).toFixed(2)}s`,
      size: 0.55 + (i % 5) * 0.18,
    };
  });
}

export default function WeatherBackground({ theme }) {
  const name = theme?.name || "clear";
  const intensity = theme?.intensity || "medium";
  const rainCount = intensity === "heavy" ? 52 : intensity === "light" ? 22 : 36;
  const snowCount = intensity === "heavy" ? 42 : intensity === "light" ? 18 : 30;
  const showRain = name === "rain" || name === "storm";
  const showSnow = name === "snow";
  const showStorm = name === "storm";
  const showFog = name === "fog";
  const showSun = name === "clear" || name === "partly";
  const showMoon = name === "clear-night" || name === "partly-night";
  const showStars = name === "clear-night" || name === "partly-night";
  const showClouds = name !== "clear" && name !== "clear-night";

  return (
    <div className={`weather-bg weather-bg--${name}`} aria-hidden="true">
      <div className="weather-bg__sky" style={{ background: theme?.background }} />
      {showStars && (
        <div className="weather-bg__stars">
          {particles(36, 3).map((star) => (
            <span
              key={star.key}
              className="weather-bg__star"
              style={{
                left: star.left,
                top: `${(Number.parseFloat(star.left) * 0.55 + star.size * 8) % 62}%`,
                animationDelay: star.delay,
                transform: `scale(${star.size})`,
              }}
            />
          ))}
        </div>
      )}
      {showSun && <div className="weather-bg__sun" />}
      {showMoon && <div className="weather-bg__moon" />}
      {showClouds && <div className="weather-bg__clouds" />}
      {showRain && (
        <div className="weather-bg__rain">
          {particles(rainCount, 1).map((drop) => (
            <span
              key={drop.key}
              className="weather-bg__drop"
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
                opacity: 0.28 + drop.size * 0.28,
              }}
            />
          ))}
        </div>
      )}
      {showSnow && (
        <div className="weather-bg__snow">
          {particles(snowCount, 2).map((flake) => (
            <span
              key={flake.key}
              className="weather-bg__flake"
              style={{
                left: flake.left,
                animationDelay: flake.delay,
                animationDuration: `${4 + flake.size * 3}s`,
                width: `${4 + flake.size * 4}px`,
                height: `${4 + flake.size * 4}px`,
                opacity: 0.45 + flake.size * 0.25,
              }}
            />
          ))}
        </div>
      )}
      {showStorm && (
        <>
          <div className="weather-bg__flash" />
          <div className="weather-bg__flash weather-bg__flash--delayed" />
        </>
      )}
      {showFog && <div className="weather-bg__fog" />}
      <div className="weather-bg__vignette" />
    </div>
  );
}

/** @deprecated Use WeatherBackground with a storm theme. */
export function StormBackground() {
  return (
    <WeatherBackground
      theme={{
        name: "storm",
        background: "linear-gradient(180deg, #1B2433 0%, #3D4A5C 42%, #6A7380 100%)",
        intensity: "heavy",
      }}
    />
  );
}
