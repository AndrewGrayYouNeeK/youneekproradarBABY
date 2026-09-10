export * from "@/lib/units";

export function windChillF(tempF, windMph) {
  if (!Number.isFinite(tempF) || !Number.isFinite(windMph) || tempF > 50 || windMph < 3) return tempF;
  return 35.74 + 0.6215 * tempF - 35.75 * windMph ** 0.16 + 0.4275 * tempF * windMph ** 0.16;
}
