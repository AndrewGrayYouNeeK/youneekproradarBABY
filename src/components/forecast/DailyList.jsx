import { describeWeatherCode, parseLocalDate } from "@/lib/weather/conditions";

export default function DailyList({ days = [] }) {
  if (!days.length) return null;

  const start = parseLocalDate(days[0].date).toLocaleDateString([], { month: "long", day: "numeric" });
  const end = parseLocalDate(days[days.length - 1].date).toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" });

  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-white">{start} – {end}</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {days.map((day, index) => {
          const code = describeWeatherCode(day.weather_code);
          const Icon = code.icon;
          const weekday = parseLocalDate(day.date).toLocaleDateString([], { weekday: "short" });
          const precip = day.pop >= 20
            ? `${day.pop}% chance of ${day.label.toLowerCase()}`
            : day.label;
          return (
            <div
              key={day.date}
              className={`flex items-center gap-3 px-4 py-3.5 ${index > 0 ? "border-t border-white/5" : ""}`}
            >
              <div className="w-10 shrink-0 text-sm font-semibold text-white">{weekday}</div>
              <Icon className="h-6 w-6 shrink-0 text-lime-300" aria-hidden="true" />
              <div className="w-[4.6rem] shrink-0 text-sm font-semibold tabular-nums text-white">
                {day.high}° <span className="font-normal text-slate-500">| {day.low}°</span>
              </div>
              <div className="min-w-0 flex-1 truncate text-sm text-slate-300">{precip}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
