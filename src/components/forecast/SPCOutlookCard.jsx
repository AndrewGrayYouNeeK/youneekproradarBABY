import { useQuery } from "@tanstack/react-query";
import { fetchSPCOutlook } from "@/lib/weather/api";
import { CloudLightning } from "lucide-react";

const TIER_STYLES = {
  NONE:   { label: "No Severe Risk", bg: "bg-emerald-950/30", border: "border-emerald-500/30", text: "text-emerald-300" },
  TSTM:   { label: "General Thunderstorms", bg: "bg-cyan-950/30", border: "border-cyan-500/30", text: "text-cyan-300" },
  MRGL:   { label: "Marginal Risk", bg: "bg-green-950/40", border: "border-green-500/40", text: "text-green-300" },
  SLGT:   { label: "Slight Risk", bg: "bg-yellow-950/40", border: "border-yellow-500/40", text: "text-yellow-300" },
  ENH:    { label: "Enhanced Risk", bg: "bg-orange-950/40", border: "border-orange-500/40", text: "text-orange-300" },
  MDT:    { label: "Moderate Risk", bg: "bg-red-950/40", border: "border-red-500/40", text: "text-red-300" },
  HIGH:   { label: "High Risk", bg: "bg-fuchsia-950/40", border: "border-fuchsia-500/40", text: "text-fuchsia-300" },
};

export default function SPCOutlookCard({ location }) {
  const { data } = useQuery({
    queryKey: ["spc", location.latitude, location.longitude],
    queryFn: () => fetchSPCOutlook(location.latitude, location.longitude),
    staleTime: 30 * 60_000,
    retry: 1,
  });

  const tier = data?.tier || "NONE";
  const style = TIER_STYLES[tier] || TIER_STYLES.NONE;

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/30">
          <CloudLightning className={`h-5 w-5 ${style.text}`} />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            SPC Day 1 Outlook
          </div>
          <div className={`text-base font-bold ${style.text}`}>{style.label}</div>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Source: NOAA Storm Prediction Center · Updated 1300/1630/2000Z
      </p>
    </div>
  );
}