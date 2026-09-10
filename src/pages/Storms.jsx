import { useQuery } from "@tanstack/react-query";
import { Flame, RadioTower, TriangleAlert, Wind, Zap } from "lucide-react";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import useWeatherLocation from "@/hooks/useWeatherLocation";
import {
  closestReport,
  fetchHurricanes,
  fetchLightningReports,
  fetchNwsPointAlerts,
  fetchSevereOutlook,
  fetchWildfires,
} from "@/lib/api/liveHazards";
import { formatDistance } from "@/lib/geo";
import { useUnits } from "@/lib/UnitsContext";
import { outlookLabel } from "@/lib/weather/lifestyle";

export default function Storms() {
  useTabPageMemory("Storms");
  const { coords } = useWeatherLocation();
  const { units } = useUnits();

  const stormsQuery = useQuery({ queryKey: ["hurricanes"], queryFn: fetchHurricanes, refetchInterval: 300000 });
  const firesQuery = useQuery({ queryKey: ["wildfires"], queryFn: fetchWildfires, refetchInterval: 600000 });
  const lightningQuery = useQuery({ queryKey: ["lightning-reports"], queryFn: fetchLightningReports, refetchInterval: 120000 });
  const outlookQuery = useQuery({
    queryKey: ["spc-outlook", coords?.latitude, coords?.longitude],
    queryFn: () => fetchSevereOutlook(coords.latitude, coords.longitude),
    enabled: Boolean(coords),
    staleTime: 300000,
  });
  const alertsQuery = useQuery({
    queryKey: ["nws-point-alerts", coords?.latitude, coords?.longitude],
    queryFn: () => fetchNwsPointAlerts(coords.latitude, coords.longitude),
    enabled: Boolean(coords),
    refetchInterval: 180000,
  });

  const nearestLightning = coords
    ? closestReport(lightningQuery.data || [], coords.latitude, coords.longitude)
    : null;
  const nearestFire = coords
    ? closestReport(firesQuery.data || [], coords.latitude, coords.longitude)
    : null;
  const nearestStorm = coords
    ? closestReport(stormsQuery.data || [], coords.latitude, coords.longitude)
    : null;

  const outlook = outlookLabel(
    outlookQuery.data?.outlooks?.[0]?.threshold ||
    outlookQuery.data?.outlook?.[0]?.threshold ||
    outlookQuery.data?.data?.[0]?.threshold
  );

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Storms" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto flex max-w-md flex-col gap-5">
          <Hero
            icon={TriangleAlert}
            title="Severe storm risk"
            value={outlook.label}
            detail="SPC Day 1 categorical outlook for your selected location"
          />
          <Hero
            icon={Zap}
            title="Lightning"
            value={
              nearestLightning
                ? `Closest report ${formatDistance(nearestLightning.km, units.distance)}`
                : "No lightning reports nearby"
            }
            detail={nearestLightning?.city ? `Near ${nearestLightning.city}` : "NWS local storm reports, last 2 hours"}
          />
          <Hero
            icon={Wind}
            title="Hurricane center"
            value={
              stormsQuery.data?.length
                ? `${stormsQuery.data.length} active tropical cyclone${stormsQuery.data.length === 1 ? "" : "s"}`
                : "No active tropical cyclones"
            }
            detail={nearestStorm ? `Nearest: ${nearestStorm.name} · ${formatDistance(nearestStorm.km, units.distance)}` : "National Hurricane Center"}
          />

          {(stormsQuery.data || []).map((storm) => (
            <article key={storm.id} className="rounded-2xl border border-rose-400/20 bg-rose-950/20 px-4 py-4">
              <div className="text-sm font-semibold text-white">{storm.name}</div>
              <div className="mt-1 text-xs text-rose-100/80">{storm.label}</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-200">
                <div>Winds {storm.windKt} kt</div>
                <div>Pressure {storm.pressureMb} mb</div>
                <div>Moving {storm.movementSpeed} kt</div>
                <div>Heading {storm.movementDir}°</div>
              </div>
              {storm.advisoryUrl && (
                <a
                  href={storm.advisoryUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex text-xs font-semibold text-sky-300"
                >
                  Latest NHC advisory
                </a>
              )}
            </article>
          ))}

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Flame className="h-3.5 w-3.5" /> Fire center
            </h2>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-200">
              {nearestFire
                ? `${nearestFire.title} · ${formatDistance(nearestFire.km, units.distance)} away`
                : "No nearby active wildfire events from NASA EONET."}
            </div>
            <div className="mt-2 space-y-2">
              {(firesQuery.data || []).slice(0, 6).map((fire) => (
                <div key={fire.id} className="rounded-xl border border-orange-400/15 bg-orange-950/20 px-3 py-2 text-xs text-orange-50">
                  {fire.title}
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <RadioTower className="h-3.5 w-3.5" /> NWS alerts
            </h2>
            {(alertsQuery.data || []).length === 0 && (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                No active NWS alerts for this point.
              </p>
            )}
            <div className="space-y-2">
              {(alertsQuery.data || []).slice(0, 8).map((alert) => (
                <article key={alert.id} className="rounded-2xl border border-amber-400/20 bg-amber-950/20 px-4 py-3">
                  <div className="text-sm font-semibold text-amber-50">{alert.event}</div>
                  <div className="mt-1 text-[11px] text-amber-100/70">{alert.severity} · {alert.sender}</div>
                  {alert.headline && <p className="mt-2 text-xs leading-relaxed text-amber-100/80">{alert.headline}</p>}
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}

function Hero({ icon: Icon, title, value, detail }) {
  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 p-5">
      <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="mt-2 text-lg font-semibold text-white">{value}</div>
      <p className="mt-1 text-xs text-slate-400">{detail}</p>
    </section>
  );
}
