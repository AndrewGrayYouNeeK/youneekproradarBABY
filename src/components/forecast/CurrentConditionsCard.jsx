import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, CloudSun, CloudRainWind } from "lucide-react";
import { describeWeatherCode, degToCardinal } from "@/lib/weather/api";

const ICONS = { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, CloudDrizzle, CloudFog, CloudSun, CloudRainWind };

export default function CurrentConditionsCard({ data, location }) {
  if (!data) return null;
  const c = data.current || {};
  const d = data.daily || {};
  const code = describeWeatherCode(c.weather_code);
  const Icon = ICONS[code.icon] || Cloud;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card to-card/40 p-6">
      <div className="absolute -right-8 -top-8 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
              {location?.label || "Current Conditions"}
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-6xl font-extralight leading-none tabular-nums">
                {Math.round(c.temperature_2m ?? 0)}°
              </span>
              <span className="text-base text-muted-foreground">F</span>
            </div>
            <div className="mt-1 text-sm text-foreground/80">{code.label}</div>
            <div className="text-xs text-muted-foreground">
              Feels like {Math.round(c.apparent_temperature ?? 0)}°
            </div>
          </div>
          <Icon className="h-20 w-20 text-primary/80" strokeWidth={1.4} />
        </div>

        <div className="mt-5 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            H: <span className="text-foreground font-medium">{Math.round(d.temperature_2m_max?.[0] ?? 0)}°</span>
          </span>
          <span className="text-muted-foreground">
            L: <span className="text-foreground font-medium">{Math.round(d.temperature_2m_min?.[0] ?? 0)}°</span>
          </span>
          <span className="text-muted-foreground">
            Wind:{" "}
            <span className="text-foreground font-medium">
              {Math.round(c.wind_speed_10m ?? 0)} mph {degToCardinal(c.wind_direction_10m)}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}