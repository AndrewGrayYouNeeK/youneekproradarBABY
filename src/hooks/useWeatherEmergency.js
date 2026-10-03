import { useMemo } from "react";
import { resolveEmergencyState } from "@/lib/safety/weatherEmergency";

export default function useWeatherEmergency(alerts = []) {
  return useMemo(() => resolveEmergencyState(alerts), [alerts]);
}
