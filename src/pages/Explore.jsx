import { Compass, Flame, PlayCircle, Car, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/mobile/AppHeader";
import BottomTab from "@/components/radar/BottomTab";
import useTabPageMemory from "@/hooks/useTabPageMemory";
import { useActiveFires, useNhcStorms } from "@/hooks/useLiveHazards";
import { stormCategory, stormClassLabel } from "@/lib/api/live";
import useWeatherLocation from "@/hooks/useWeatherLocation";

const SAFETY_VIDEOS = [
  { href: "https://www.weather.gov/safety/tornado", title: "NWS tornado safety briefing" },
  { href: "https://www.weather.gov/safety/lightning", title: "Lightning safety — when thunder roars" },
  { href: "https://www.weather.gov/safety/hurricane", title: "Hurricane center preparedness" },
  { href: "https://www.weather.gov/safety/winter", title: "Winter storm safety" },
  { href: "https://www.youtube.com/@NWS", title: "NWS live weather videos" },
];

export default function Explore() {
  useTabPageMemory("Explore");
  const navigate = useNavigate();
  const { coords } = useWeatherLocation();
  const { data: stormsData, isLoading: stormsLoading } = useNhcStorms();
  const { data: firesData, isLoading: firesLoading } = useActiveFires();
  const storms = stormsData?.activeStorms || [];
  const fires = (firesData?.features || []).slice(0, 8);
  const mapsHref = coords
    ? `https://www.google.com/maps/@${coords.latitude},${coords.longitude},12z/data=!5m1!1e1`
    : "https://www.google.com/maps";

  return (
    <div className="flex h-[100dvh] flex-col bg-slate-950">
      <AppHeader title="Explore" />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 pb-28">
        <div className="mx-auto flex max-w-md flex-col gap-6">
          <section>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Compass className="h-3.5 w-3.5" /> Hurricane Center
            </div>
            {stormsLoading && <p className="text-sm text-slate-500">Loading tropical cyclones…</p>}
            {!stormsLoading && !storms.length && (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                No active NHC storms right now.
              </p>
            )}
            <div className="space-y-2">
              {storms.map((storm) => (
                <a
                  key={storm.id}
                  href={storm.publicAdvisory?.url || storm.forecastGraphics?.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-rose-400/20 bg-rose-950/30 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-white">{storm.name}</div>
                    <div className="text-xs text-rose-200">{stormCategory(storm.intensity)}</div>
                  </div>
                  <div className="mt-1 text-xs text-rose-100/80">
                    {stormClassLabel(storm.classification)} · {storm.intensity} kt · {storm.pressure} mb
                  </div>
                  <div className="mt-1 text-[11px] text-slate-400">
                    {storm.latitude} {storm.longitude} · moving {storm.movementDir}° at {storm.movementSpeed} kt
                  </div>
                </a>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Flame className="h-3.5 w-3.5" /> Fire Center
            </div>
            {firesLoading && <p className="text-sm text-slate-500">Loading incidents…</p>}
            {!firesLoading && !fires.length && (
              <p className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                No large-fire incidents in the current feed.
              </p>
            )}
            <div className="space-y-2">
              {fires.map((feature) => {
                const props = feature.properties || {};
                return (
                  <div key={props.UniqueFireIdentifier || props.IncidentName} className="rounded-2xl border border-orange-400/20 bg-orange-950/30 px-4 py-3">
                    <div className="text-sm font-semibold text-white">{props.IncidentName || "Fire"}</div>
                    <div className="mt-1 text-xs text-orange-100/80">
                      {props.POOCounty || ""} {props.POOState || ""} · {Math.round(props.IncidentSize || 0).toLocaleString()} acres
                    </div>
                    <div className="mt-1 text-[11px] text-slate-400">
                      {Math.round(props.PercentContained || 0)}% contained · {props.FireCause || "Cause unknown"}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <PlayCircle className="h-3.5 w-3.5" /> Weather videos & safety
            </div>
            <div className="space-y-2">
              {SAFETY_VIDEOS.map((video) => (
                <a
                  key={video.href}
                  href={video.href}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white"
                >
                  {video.title}
                </a>
              ))}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Users className="h-3.5 w-3.5" /> Shelter contacts
            </div>
            <button
              type="button"
              onClick={() => navigate("/Contacts")}
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left"
            >
              <div className="text-sm font-medium text-white">Manage emergency contacts</div>
              <p className="mt-1 text-xs text-slate-400">
                One-tap shelter SMS with your GPS — a YouNeeK exclusive WeatherBug doesn't have.
              </p>
            </button>
          </section>

          <section>
            <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Car className="h-3.5 w-3.5" /> Travel & traffic
            </div>
            <a
              href={mapsHref}
              target="_blank"
              rel="noreferrer"
              className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
            >
              <div className="text-sm font-medium text-white">Open live traffic near you</div>
              <p className="mt-1 text-xs text-slate-400">
                Road weather is on the Forecast tab. Tap through for live congestion, like WeatherBug traffic — without the ads.
              </p>
            </a>
          </section>
        </div>
      </div>
      <BottomTab />
    </div>
  );
}
