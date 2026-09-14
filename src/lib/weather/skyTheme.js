export const WEATHERBUG_GOLD = "#FFD400";
export const WEATHERBUG_BLUE = "#1E7BD6";
export const WEATHERBUG_SKY = "#4DA6EA";

const THEMES = {
  storm: {
    name: "storm",
    background: "linear-gradient(180deg, #1B2433 0%, #3D4A5C 42%, #6A7380 100%)",
  },
  snow: {
    name: "snow",
    background: "linear-gradient(180deg, #7A8B9C 0%, #C5D0D8 55%, #E8EEF2 100%)",
  },
  rain: {
    name: "rain",
    background: "linear-gradient(180deg, #4E5D6C 0%, #6E8496 45%, #8FA4B5 100%)",
  },
  fog: {
    name: "fog",
    background: "linear-gradient(180deg, #8A97A3 0%, #B7C0C8 100%)",
  },
  overcast: {
    name: "overcast",
    background: "linear-gradient(180deg, #5B7D9A 0%, #8EADC4 55%, #B9C9D4 100%)",
  },
  partly: {
    name: "partly",
    background: "linear-gradient(180deg, #3B8FD4 0%, #7EB6E8 48%, #C5DFF6 100%)",
  },
  "partly-night": {
    name: "partly-night",
    background: "linear-gradient(180deg, #0F1C3A 0%, #243868 100%)",
  },
  "clear-night": {
    name: "clear-night",
    background: "linear-gradient(180deg, #071428 0%, #16315C 50%, #2A4A7A 100%)",
  },
  clear: {
    name: "clear",
    background: "linear-gradient(180deg, #1E7BD6 0%, #4DA6EA 38%, #87CEFA 72%, #B3E0FF 100%)",
  },
};

export function skyTheme({ weatherCode = 0, daylight = true } = {}) {
  const code = Number(weatherCode) || 0;
  if (code >= 95) return THEMES.storm;
  if ((code >= 71 && code < 80) || code >= 85) return THEMES.snow;
  if (code >= 51 || (code >= 80 && code < 85)) return THEMES.rain;
  if (code === 45 || code === 48) return THEMES.fog;
  if (code === 3) return THEMES.overcast;
  if (code === 2) return daylight ? THEMES.partly : THEMES["partly-night"];
  if (!daylight) return THEMES["clear-night"];
  return THEMES.clear;
}

export function weatherIconClass(code) {
  const value = Number(code) || 0;
  if (value <= 1) return "text-yellow-300";
  if (value === 2) return "text-yellow-200";
  if (value >= 95) return "text-yellow-300";
  if ((value >= 71 && value < 80) || value >= 85) return "text-white";
  if (value >= 51) return "text-sky-100";
  return "text-white";
}

export const frostCard =
  "rounded-2xl border border-white/25 bg-white/15 shadow-[0_8px_32px_rgba(15,40,70,0.18)] backdrop-blur-md";
