import { describeWeatherCode, formatHourTime } from "@/lib/weather/conditions";
import { frostCard, weatherIconClass } from "@/lib/weather/skyTheme";

export default function HourlyStrip({ hours = [] }) {
  if (!hours.length) return null;

  return (
    <section>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/80">
        Hourly
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {hours.map((hour) => {
          const code = describeWeatherCode(hour.weather_code);
          const Icon = code.icon;
          return (
            <div key={hour.time} className={`min-w-[4.75rem] px-3 py-3 text-center ${frostCard}`}>
              <div className="text-[11px] text-white/80">{formatHourTime(hour.time)}</div>
              <Icon className={`mx-auto my-2 h-5 w-5 ${weatherIconClass(hour.weather_code)}`} aria-hidden="true" />
              <div className="text-sm font-semibold text-white">{hour.temperature}°</div>
              <div className="mt-1 text-[10px] text-white/70">{hour.pop}%</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
