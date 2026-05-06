import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchForecastDiscussion } from "@/lib/weather/api";
import { FileText, ChevronDown, ChevronUp } from "lucide-react";

export default function ForecastDiscussion({ location }) {
  const [open, setOpen] = useState(false);
  const { data, isLoading, error } = useQuery({
    queryKey: ["afd", location.latitude, location.longitude],
    queryFn: () => fetchForecastDiscussion(location.latitude, location.longitude),
    staleTime: 30 * 60_000,
    retry: 1,
  });

  if (error) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-secondary/40"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-semibold">Forecast Discussion</div>
          <div className="text-[11px] text-muted-foreground">
            {data?.office ? `WFO ${data.office} · ` : ""}
            {data?.issued ? new Date(data.issued).toLocaleString([], { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Meteorologist's narrative"}
          </div>
        </div>
        {open ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {open && (
        <div className="border-t border-border/60 px-4 py-3">
          {isLoading ? (
            <div className="text-xs text-muted-foreground">Loading discussion…</div>
          ) : data?.text ? (
            <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/80 max-h-96 overflow-y-auto">
              {data.text}
            </pre>
          ) : (
            <div className="text-xs text-muted-foreground">No discussion available.</div>
          )}
          <p className="mt-3 text-[10px] uppercase tracking-wide text-muted-foreground">Source: NWS</p>
        </div>
      )}
    </div>
  );
}