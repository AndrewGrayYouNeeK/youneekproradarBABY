/**
 * Animated storm backdrop: falling rain + occasional lightning flashes.
 * Pure CSS — no canvas, lightweight for mobile.
 */
export default function StormBackground() {
  return (
    <div className="storm-bg pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="storm-bg__sky" />
      <div className="storm-bg__clouds" />
      <div className="storm-bg__rain">
        {Array.from({ length: 48 }, (_, i) => (
          <span
            key={i}
            className="storm-bg__drop"
            style={{
              left: `${(i * 2.1) % 100}%`,
              animationDelay: `${(i * 0.13) % 2}s`,
              animationDuration: `${0.55 + (i % 7) * 0.08}s`,
              opacity: 0.25 + (i % 5) * 0.12,
            }}
          />
        ))}
      </div>
      <div className="storm-bg__flash" />
      <div className="storm-bg__flash storm-bg__flash--delayed" />
      <div className="storm-bg__vignette" />
    </div>
  );
}
