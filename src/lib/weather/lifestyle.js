export function describeAqi(usAqi) {
  if (!Number.isFinite(usAqi)) return { label: "Unavailable", color: "slate", bar: "bg-slate-500", tone: "text-slate-400" };
  if (usAqi <= 50) return { label: "Good", color: "emerald", bar: "bg-emerald-400", tone: "text-emerald-300" };
  if (usAqi <= 100) return { label: "Moderate", color: "yellow", bar: "bg-yellow-400", tone: "text-yellow-300" };
  if (usAqi <= 150) return { label: "Unhealthy for sensitive groups", color: "orange", bar: "bg-orange-400", tone: "text-orange-300" };
  if (usAqi <= 200) return { label: "Unhealthy", color: "red", bar: "bg-red-500", tone: "text-red-300" };
  if (usAqi <= 300) return { label: "Very unhealthy", color: "fuchsia", bar: "bg-fuchsia-500", tone: "text-fuchsia-300" };
  return { label: "Hazardous", color: "rose", bar: "bg-rose-700", tone: "text-rose-300" };
}

export function describeUv(uv) {
  if (!Number.isFinite(uv)) return { label: "—", color: "slate" };
  if (uv < 3) return { label: "Low", color: "emerald" };
  if (uv < 6) return { label: "Moderate", color: "yellow" };
  if (uv < 8) return { label: "High", color: "orange" };
  if (uv < 11) return { label: "Very high", color: "red" };
  return { label: "Extreme", color: "fuchsia" };
}

export function describePollen(value) {
  if (!Number.isFinite(value) || value <= 0) return { label: "None", color: "emerald", tone: "text-emerald-300" };
  if (value < 20) return { label: "Low", color: "emerald", tone: "text-emerald-300" };
  if (value < 50) return { label: "Moderate", color: "yellow", tone: "text-yellow-300" };
  if (value < 100) return { label: "High", color: "orange", tone: "text-orange-300" };
  return { label: "Very high", color: "red", tone: "text-red-300" };
}

export const aqiLabel = describeAqi;
export const pollenLabel = describePollen;

export function predominantPollen(pollen) {
  const entries = Object.entries(pollen || {}).filter(([, value]) => Number.isFinite(value) && value > 0);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return entries.slice(0, 3).map(([name, value]) => ({
    name: name.replace(/_/g, " "),
    value,
  }));
}

export function describeHeat(heatF) {
  if (!Number.isFinite(heatF)) return { label: "—", color: "slate" };
  if (heatF < 80) return { label: "Comfortable", color: "emerald" };
  if (heatF < 90) return { label: "Caution", color: "yellow" };
  if (heatF < 103) return { label: "Extreme caution", color: "orange" };
  if (heatF < 125) return { label: "Danger", color: "red" };
  return { label: "Extreme danger", color: "fuchsia" };
}

export function formatMoonPhase(phase) {
  if (phase == null || phase === "") return "—";
  if (typeof phase === "string") {
    return phase.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase()).trim();
  }
  const t = ((Number(phase) % 1) + 1) % 1;
  if (t < 0.03 || t > 0.97) return "New Moon";
  if (t < 0.22) return "Waxing Crescent";
  if (t < 0.28) return "First Quarter";
  if (t < 0.47) return "Waxing Gibbous";
  if (t < 0.53) return "Full Moon";
  if (t < 0.72) return "Waning Gibbous";
  if (t < 0.78) return "Last Quarter";
  return "Waning Crescent";
}

export function moonPhaseFromDate(date = new Date()) {
  const synodic = 29.53058867;
  const known = Date.UTC(2000, 0, 6, 18, 14, 0);
  const days = (date.getTime() - known) / 86400000;
  return ((days / synodic) % 1 + 1) % 1;
}

export function classifyStorm(code, windKt) {
  const upper = String(code || "").toUpperCase();
  if (upper === "HU" || upper.includes("HURRICANE")) {
    if (windKt >= 137) return "Category 5 Hurricane";
    if (windKt >= 113) return "Category 4 Hurricane";
    if (windKt >= 96) return "Category 3 Hurricane";
    if (windKt >= 83) return "Category 2 Hurricane";
    return "Category 1 Hurricane";
  }
  if (upper === "TS" || upper.includes("TROPICAL STORM")) return "Tropical Storm";
  if (upper === "TD" || upper.includes("DEPRESSION")) return "Tropical Depression";
  if (upper === "PTC") return "Potential Tropical Cyclone";
  if (upper === "STS") return "Subtropical Storm";
  return upper || "Tropical cyclone";
}

export function outlookLabel(category) {
  const value = String(category || "").toUpperCase();
  if (value.includes("HIGH")) return { label: "High", color: "fuchsia" };
  if (value.includes("MDT") || value.includes("MODERATE")) return { label: "Moderate", color: "red" };
  if (value.includes("ENH") || value.includes("ENHANCED")) return { label: "Enhanced", color: "orange" };
  if (value.includes("SLGT") || value.includes("SLIGHT")) return { label: "Slight", color: "yellow" };
  if (value.includes("MRGL") || value.includes("MARGINAL")) return { label: "Marginal", color: "lime" };
  if (value.includes("TSTM") || value.includes("THUNDER")) return { label: "Thunderstorms", color: "emerald" };
  return { label: category || "No severe risk", color: "slate" };
}

function scoreFrom(value, goodHigh = true) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 50;
  return goodHigh ? Math.max(0, Math.min(100, n)) : Math.max(0, Math.min(100, 100 - n));
}

export function buildLifestyle(current = {}, hourly = [], air = {}) {
  const uv = current.uv_index ?? air.uv;
  const humidity = current.relative_humidity_2m;
  const wind = current.wind_speed_10m;
  const aqi = air.aqi ?? air.usAqi;
  const pollen = air.pollen ?? air.pollenMax;
  const cape = current.cape ?? hourly[0]?.cape;

  return [
    {
      id: "outdoor",
      label: "Outdoor",
      score: scoreFrom(100 - (uv > 7 ? 25 : 0) - (aqi > 100 ? 30 : 0) - (humidity > 85 ? 15 : 0)),
      hint: uv >= 8 ? "High UV — shade and sunscreen" : "Decent for being outside",
    },
    {
      id: "running",
      label: "Running",
      score: scoreFrom(100 - (heatIndexPenalty(current)) - (aqi > 100 ? 25 : 0)),
      hint: wind > 20 ? "Gusty — ease the pace" : "Fine for a run if you hydrate",
    },
    {
      id: "allergy",
      label: "Allergy",
      score: scoreFrom(pollen, false),
      hint: Number(pollen) > 50 ? "Pollen is elevated" : "Pollen looks manageable",
    },
    {
      id: "storm",
      label: "Storm risk",
      score: scoreFrom(cape ? Math.min(100, cape / 20) : 20, false),
      hint: cape > 1500 ? "Unstable air — keep an eye on radar" : "Limited convective fuel right now",
    },
  ];
}

function heatIndexPenalty(current) {
  const t = current.temperature_2m;
  const rh = current.relative_humidity_2m;
  if (!Number.isFinite(t) || t < 80) return 0;
  if (t >= 95 && rh >= 50) return 40;
  if (t >= 88) return 20;
  return 8;
}

