import { useState } from "react";
import { describeWeatherCode, formatHourTime } from "@/lib/weather/conditions";
import { frostCard, weatherIconClass, WEATHERBUG_GOLD } from "@/lib/weather/skyTheme";

function dayKey(iso) {
  return new Date(iso).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
}

function weekday(iso) {
  return new Date(iso).toLocaleDateString([], { weekday: "short" });
}

export default function HourlyList({ hours = [] }) {
  const days = [];
  hours.forEach((hour) => {
    const key = dayKey(hour.time);
    const last = days[days.length - 1];
    if (!last || last.key !== key) {
      days.push({ key, label: weekday(hour.time), hours: [hour] });
    } else {
      last.hours.push(hour);
    }
  });

  const [selectedKey, setSelectedKey] = useState(days[0]?.key || "");
  if (!days.length) return null;
  const active = days.find((day) => day.key === selectedKey) || days[0];

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3">
        <div className="mx-auto max-w-md">
          <div className="py-3 text-sm font-semibold text-white drop-shadow">{active.key}</div>
          <div className={`overflow-hidden ${frostCard}`}>
            {active.hours.map((hour, index) => {
              const code = describeWeatherCode(hour.weather_code);
              const Icon = code.icon;
              return (
                <div
                  key={hour.time}
                  className={`grid grid-cols-[4.5rem_3.25rem_2rem_1fr] items-center gap-2 px-4 py-3 ${
                    index > 0 ? "border-t border-white/15" : ""
                  }`}
                >
                  <div className="text-lg font-semibold tabular-nums text-white">{formatHourTime(hour.time)}</div>
                  <div className="text-lg font-semibold tabular-nums text-white">{hour.temperature}°</div>
                  <Icon className={`h-6 w-6 ${weatherIconClass(hour.weather_code)}`} aria-hidden="true" />
                  <div className="text-right text-xs text-white/75">{hour.pop}% precip</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="shrink-0 border-t border-white/20 bg-black/20 px-2 py-2 backdrop-blur-md">
        <div className="mx-auto flex max-w-md gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {days.map((day) => {
            const selected = day.key === active.key;
            return (
              <button
                key={day.key}
                type="button"
                onClick={() => setSelectedKey(day.key)}
                className={`min-h-10 min-w-[3.2rem] rounded-full px-3 text-sm font-semibold ${
                  selected ? "text-slate-950" : "text-white/80"
                }`}
                style={selected ? { background: WEATHERBUG_GOLD } : undefined}
              >
                {day.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
