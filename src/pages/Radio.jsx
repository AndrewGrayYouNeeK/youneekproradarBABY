import { useEffect, useMemo, useRef, useState } from "react";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import useLocation from "@/hooks/useLocation";
import { NOAA_STATIONS, nearestStation } from "@/lib/noaaStations";
import { Play, Pause, Volume2, VolumeX, Radio as RadioIcon, MapPin, Search, AlertTriangle } from "lucide-react";

export default function Radio() {
  const { location, loading: locLoading } = useLocation();
  const audioRef = useRef(null);
  const [station, setStation] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.8);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [loadingAudio, setLoadingAudio] = useState(false);

  // Auto-tune nearest station on mount
  useEffect(() => {
    if (locLoading || station) return;
    const { station: nearest } = nearestStation(location.latitude, location.longitude);
    if (nearest) setStation(nearest);
  }, [locLoading, location.latitude, location.longitude, station]);

  // Apply volume / mute
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
    }
  }, [volume, muted]);

  // Switch source when station changes
  useEffect(() => {
    if (!station || !audioRef.current) return;
    setError(null);
    audioRef.current.src = station.stream;
    if (playing) {
      setLoadingAudio(true);
      audioRef.current.play().catch(() => {
        setError("Could not connect to this station's stream.");
        setPlaying(false);
        setLoadingAudio(false);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [station?.id]);

  const togglePlay = async () => {
    if (!audioRef.current || !station) return;
    if (playing) {
      audioRef.current.pause();
      setPlaying(false);
      return;
    }
    setError(null);
    setLoadingAudio(true);
    try {
      audioRef.current.src = station.stream;
      await audioRef.current.play();
      setPlaying(true);
    } catch {
      setError("Could not connect to this station's stream.");
    } finally {
      setLoadingAudio(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return NOAA_STATIONS;
    return NOAA_STATIONS.filter(
      (s) =>
        s.city.toLowerCase().includes(q) ||
        s.state.toLowerCase().includes(q) ||
        s.call.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <div className="min-h-screen bg-background pb-24">
      <AppHeader title="NOAA Radio" location={station ? `${station.city}, ${station.state}` : null} />

      <audio
        ref={audioRef}
        preload="none"
        onPlaying={() => { setLoadingAudio(false); setPlaying(true); }}
        onWaiting={() => setLoadingAudio(true)}
        onError={() => { setError("Stream offline or unreachable."); setPlaying(false); setLoadingAudio(false); }}
        onEnded={() => setPlaying(false)}
      />

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        {/* Now Playing */}
        <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/15 via-card to-card p-5">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              <RadioIcon className="h-3.5 w-3.5" />
              {playing ? "On Air" : "Tuned"}
              {playing && <span className="ml-1 h-1.5 w-1.5 animate-pulse rounded-full bg-primary" />}
            </div>

            <div className="mt-3">
              <div className="text-2xl font-bold leading-tight">
                {station ? `${station.city}, ${station.state}` : "Finding nearest station…"}
              </div>
              {station && (
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="font-mono">{station.call}</span>
                  <span>·</span>
                  <span>{station.freq} MHz</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center gap-3">
              <button
                onClick={togglePlay}
                disabled={!station || loadingAudio}
                aria-label={playing ? "Pause" : "Play"}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-105 disabled:opacity-50"
              >
                {loadingAudio ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : playing ? (
                  <Pause className="h-6 w-6" fill="currentColor" />
                ) : (
                  <Play className="h-6 w-6 translate-x-0.5" fill="currentColor" />
                )}
              </button>

              <button
                onClick={() => setMuted(!muted)}
                aria-label={muted ? "Unmute" : "Mute"}
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/60 bg-secondary/50 hover:bg-secondary"
              >
                {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                aria-label="Volume"
                className="flex-1 accent-primary"
                style={{ minHeight: "auto" }}
              />
            </div>

            {error && station && (
              <div className="mt-3 space-y-2 rounded-xl border border-red-500/40 bg-red-950/30 px-3 py-2.5 text-xs text-red-200">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span>{error}</span>
                </div>
                {station.source && (
                  <a
                    href={station.source}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-red-900/40 px-2.5 py-1 text-[11px] font-semibold text-red-100 hover:bg-red-900/60"
                  >
                    Open source page →
                  </a>
                )}
              </div>
            )}

            <div className="mt-3 rounded-xl bg-secondary/30 px-3 py-2 text-[10px] leading-relaxed text-muted-foreground">
              Streams are public Broadcastify feeds. Some browsers may block playback due to CORS or
              regional restrictions. If a station won't play, tap "Open source page" to listen on
              broadcastify.com.
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search city, state, or call sign"
            className="w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
        </div>

        {/* Station list */}
        <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
          <div className="border-b border-border/60 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            All Stations
          </div>
          <ul className="divide-y divide-border/40">
            {filtered.map((s) => {
              const active = station?.id === s.id;
              return (
                <li key={s.id}>
                  <button
                    onClick={() => setStation(s)}
                    className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                      active ? "bg-primary/10" : "hover:bg-secondary/50"
                    }`}
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${active ? "bg-primary/20" : "bg-secondary"}`}>
                      <MapPin className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium">{s.city}, {s.state}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{s.call} · {s.freq} MHz</div>
                    </div>
                    {active && playing && (
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Live</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <p className="px-2 pb-2 text-center text-[11px] text-muted-foreground">
          NOAA Weather Radio All Hazards · Public streams may be subject to availability
        </p>
      </div>

      <BottomNav />
    </div>
  );
}