export const DEFAULT_UNITS = {
  temp: "F",
  wind: "mph",
  pressure: "inHg",
  precip: "in",
  distance: "mi",
};

export const UNIT_STORAGE_KEY = "pref_units_v1";

export function loadUnits() {
  try {
    return { ...DEFAULT_UNITS, ...JSON.parse(localStorage.getItem(UNIT_STORAGE_KEY) || "{}") };
  } catch {
    return { ...DEFAULT_UNITS };
  }
}

export function saveUnits(units) {
  localStorage.setItem(UNIT_STORAGE_KEY, JSON.stringify(units));
}

export function fToC(f) {
  return ((f - 32) * 5) / 9;
}

export function formatTemp(f, unit = "F") {
  if (!Number.isFinite(f)) return "—";
  return unit === "C" ? `${Math.round(fToC(f))}°` : `${Math.round(f)}°`;
}

export function formatTempValue(f, unit = "F") {
  if (!Number.isFinite(f)) return null;
  return unit === "C" ? Math.round(fToC(f)) : Math.round(f);
}

export function formatWind(mph, unit = "mph") {
  if (!Number.isFinite(mph)) return "—";
  if (unit === "kph") return `${Math.round(mph * 1.60934)} kph`;
  if (unit === "kt") return `${Math.round(mph * 0.868976)} kt`;
  if (unit === "mps") return `${(mph * 0.44704).toFixed(1)} m/s`;
  return `${Math.round(mph)} mph`;
}

export function formatPressure(mb, unit = "inHg") {
  if (!Number.isFinite(mb)) return "—";
  if (unit === "mb") return `${Math.round(mb)} mb`;
  return `${(mb * 0.02953).toFixed(2)}"`;
}

export function formatPrecip(inches, unit = "in") {
  if (!Number.isFinite(inches)) return "—";
  if (unit === "mm") return `${(inches * 25.4).toFixed(inches >= 0.1 ? 1 : 2)} mm`;
  return `${inches.toFixed(inches >= 1 ? 1 : 2)}"`;
}

export function formatVisibility(miles, unit = "mi") {
  if (!Number.isFinite(miles)) return "—";
  if (unit === "km") return `${(miles * 1.60934).toFixed(1)} km`;
  return `${Math.round(miles)} mi`;
}

export function heatIndexF(tempF, humidityPct) {
  if (!Number.isFinite(tempF) || !Number.isFinite(humidityPct) || tempF < 80) return tempF;
  const T = tempF;
  const R = humidityPct;
  return (
    -42.379 +
    2.04901523 * T +
    10.14333127 * R -
    0.22475541 * T * R -
    0.00683783 * T * T -
    0.05481717 * R * R +
    0.00122874 * T * T * R +
    0.00085282 * T * R * R -
    0.00000199 * T * T * R * R
  );
}
