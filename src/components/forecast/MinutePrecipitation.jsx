export default function MinutePrecipitation({ minutes = [] }) {
  if (!minutes.length) return null;

  const peak = Math.max(...minutes.map((minute) => minute.intensity || minute.chance / 100), 0.05);
  const nextWet = minutes.find((minute) => minute.intensity > 0.01 || minute.chance >= 20);

  return (
    <section>
      <div className="mb-3 flex items-end justify-between">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
          Next Hour
        </h2>
        <p className="text-[11px] text-white/75">
          {nextWet
            ? `Precipitation likely around ${new Date(nextWet.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`
            : "Dry through the next hour"}
        </p>
      </div>
      <div className="rounded-2xl border border-white/25 bg-white/15 px-3 py-3 backdrop-blur-md">
        <div className="flex h-16 items-end gap-px">
          {minutes.map((minute) => {
            const height = Math.max(6, Math.round(((minute.intensity || minute.chance / 100) / peak) * 100));
            return (
              <div
                key={minute.time}
                className="min-w-0 flex-1 rounded-t-sm bg-sky-400/80"
                style={{ height: `${height}%`, opacity: minute.chance > 0 ? 0.45 + minute.chance / 200 : 0.2 }}
                title={`${new Date(minute.time).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })} · ${minute.chance}%`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-white/70">
          <span>Now</span>
          <span>+60 min</span>
        </div>
      </div>
    </section>
  );
}
