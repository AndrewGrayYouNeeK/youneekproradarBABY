import { formatClock, formatPrecipType } from "@/lib/weather/conditions";

export default function MinutePrecipitation({ minutes = [], summary = [] }) {
  if (!minutes.length) return null;

  const peak = Math.max(...minutes.map((minute) => minute.intensity || minute.chance / 100), 0.05);
  const nextWet = minutes.find((minute) => minute.intensity > 0.01 || minute.chance >= 20);
  const headline = summary[0]
    ? `${formatPrecipType(summary[0].condition) || "Dry"} through the next hour`
    : nextWet
      ? `Precipitation likely around ${formatClock(nextWet.time)}`
      : "Dry through the next hour";

  return (
    <section>
      <div className="mb-3 flex items-end justify-between gap-3">
        <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
          Next Hour
        </h2>
        <p className="text-right text-[11px] text-slate-500">{headline}</p>
      </div>
      {summary.length > 1 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {summary.map((item) => (
            <span
              key={item.time}
              className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-300"
            >
              {formatClock(item.time)} · {formatPrecipType(item.condition) || "Clear"}
              {item.chance ? ` · ${item.chance}%` : ""}
            </span>
          ))}
        </div>
      )}
      <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3">
        <div className="flex h-16 items-end gap-px">
          {minutes.map((minute) => {
            const height = Math.max(6, Math.round(((minute.intensity || minute.chance / 100) / peak) * 100));
            return (
              <div
                key={minute.time}
                className="min-w-0 flex-1 rounded-t-sm bg-sky-400/80"
                style={{ height: `${height}%`, opacity: minute.chance > 0 ? 0.45 + minute.chance / 200 : 0.2 }}
                title={`${formatClock(minute.time)} · ${minute.chance}%`}
              />
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-slate-500">
          <span>Now</span>
          <span>+60 min</span>
        </div>
      </div>
    </section>
  );
}
