import { useQuery } from "@tanstack/react-query";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import AlertCard from "@/components/alerts/AlertCard";
import RefreshSpinner from "@/components/ui/RefreshSpinner";
import useLocation from "@/hooks/useLocation";
import usePullToRefresh from "@/hooks/usePullToRefresh";
import { fetchActiveAlerts, alertSeverity } from "@/lib/weather/api";
import { ShieldCheck, RefreshCw, AlertTriangle } from "lucide-react";

export default function Alerts() {
  const { location, loading: locLoading } = useLocation();

  const { data, refetch, isFetching } = useQuery({
    queryKey: ["alerts", location.latitude, location.longitude],
    queryFn: () => fetchActiveAlerts(location.latitude, location.longitude),
    enabled: !locLoading,
    staleTime: 60_000,
    refetchInterval: 2 * 60_000,
  });

  const { isRefreshing, pullToRefreshHandlers } = usePullToRefresh({ onRefresh: () => refetch() });

  const alerts = (data?.features || [])
    .slice()
    .sort((a, b) => alertSeverity(b.properties?.event).priority - alertSeverity(a.properties?.event).priority);

  return (
    <div className="relative min-h-screen bg-background pb-24" {...pullToRefreshHandlers}>
      <RefreshSpinner visible={isRefreshing || isFetching} />
      <AppHeader
        title="Active Alerts"
        location={location.label || `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`}
        right={
          <button
            onClick={() => refetch()}
            aria-label="Refresh"
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-secondary"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? "animate-spin text-primary" : "text-muted-foreground"}`} />
          </button>
        }
      />

      <div className="mx-auto max-w-md space-y-3 px-4 pt-4">
        {alerts.length === 0 ? (
          <div className="rounded-3xl border border-emerald-500/30 bg-emerald-950/30 p-8 text-center">
            <ShieldCheck className="mx-auto mb-3 h-12 w-12 text-emerald-400" />
            <div className="text-base font-semibold text-emerald-100">All Clear</div>
            <p className="mt-1 text-sm text-emerald-200/70">
              No active weather alerts for your area.
            </p>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-2 px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <AlertTriangle className="h-3.5 w-3.5" />
              {alerts.length} Active {alerts.length === 1 ? "Alert" : "Alerts"}
            </div>
            {alerts.map((a) => (
              <AlertCard key={a.id || a.properties?.id} alert={a} />
            ))}
          </>
        )}

        <p className="px-2 pt-3 text-center text-[11px] text-muted-foreground">
          Source: National Weather Service · api.weather.gov
        </p>
      </div>

      <BottomNav />
    </div>
  );
}