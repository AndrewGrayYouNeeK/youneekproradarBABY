import { describeWeatherCode, parseLocalDate } from "@/lib/weather/conditions";
import { frostCard, weatherIconClass } from "@/lib/weather/skyTheme";

export default function DailyList({ days = [] }) {
  if (!days.length) return null;

  const start = parseLocalDate(days[0].date).toLocaleDateString([], { month: "long", day: "numeric" });
  const end = parseLocalDate(days[days.length - 1].date).toLocaleDateString([], {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <section>
      <div className="mb-3 flex items-center justify-between px-1">
        <h2 className="text-sm font-semibold text-white drop-shadow">
          {start} – {end}
        </h2>
      </div>
      <div className={`overflow-hidden ${frostCard}`}>
        {days.map((day, index) => {
          const code = describeWeatherCode(day.weather_code);
          const Icon = code.icon;
          const weekday = parseLocalDate(day.date).toLocaleDateString([], { weekday: "short" });
          const precip = day.pop >= 20 ? `${day.pop}% chance of ${day.label.toLowerCase()}` : day.label;
          return (
            <div
              key={day.date}
              className={`flex items-center gap-3 px-4 py-3.5 ${index > 0 ? "border-t border-white/15" : ""}`}
            >
              <div className="w-10 shrink-0 text-sm font-semibold text-white">{weekday}</div>
              <Icon className={`h-6 w-6 shrink-0 ${weatherIconClass(day.weather_code)}`} aria-hidden="true" />
              <div className="w-[4.6rem] shrink-0 text-sm font-semibold tabular-nums text-white">
                {day.high}° <span className="font-normal text-white/70">| {day.low}°</span>
              </div>
              <div className="min-w-0 flex-1 truncate text-sm text-white/85">{precip}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
