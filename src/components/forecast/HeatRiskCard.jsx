import { useQuery } from "@tanstack/react-query";
import { fetchHeatRisk } from "@/lib/weather/api";
import { Thermometer } from "lucide-react";

const TIER_STYLES = [
  { bg: "bg-secondary/40", border: "border-border/60", text: "text-muted-foreground" },     // 0
  { bg: "bg-yellow-950/40", border: "border-yellow-500/40", text: "text-yellow-300" },       // 1
  { bg: "bg-orange-950/40", border: "border-orange-500/40", text: "text-orange-300" },       // 2
  { bg: "bg-red-950/40", border: "border-red-500/40", text: "text-red-300" },                // 3
  { bg: "bg-fuchsia-950/40", border: "border-fuchsia-500/40", text: "text-fuchsia-300" },    // 4
];

export default function HeatRiskCard({ location }) {
  const { data } = useQuery({
    queryKey: ["heat", location.latitude, location.longitude],
    queryFn: () => fetchHeatRisk(location.latitude, location.longitude),
    staleTime: 30 * 60_000,
    retry: 1,
  });

  if (!data || data.tier === 0) return null;
  const style = TIER_STYLES[data.tier] || TIER_STYLES[0];

  return (
    <div className={`rounded-2xl border ${style.border} ${style.bg} p-4`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/30">
          <Thermometer className={`h-5 w-5 ${style.text}`} />
        </div>
        <div className="flex-1">
          <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            HeatRisk Today
          </div>
          <div className={`text-base font-bold ${style.text}`}>{data.label} · Peak {data.peakF}°F</div>
        </div>
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground">
        Source: NWS HeatRisk · Hydrate, limit outdoor activity at peak hours
      </p>
    </div>
  );
}