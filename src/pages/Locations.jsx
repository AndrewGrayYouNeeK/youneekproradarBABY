import { useState } from "react";
import { useNavigate } from "react-router-dom";
import AppHeader from "@/components/nav/AppHeader";
import BottomNav from "@/components/nav/BottomNav";
import { setStoredLocation } from "@/lib/weather/locationUtils";
import {
  getSavedLocations, addSavedLocation, removeSavedLocation, searchLocations,
} from "@/lib/weather/savedLocations";
import { Search, MapPin, Plus, Trash2, Check, Star } from "lucide-react";

export default function Locations() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [saved, setSaved] = useState(getSavedLocations);

  const doSearch = async (q) => {
    setQuery(q);
    if (q.length < 2) { setResults([]); return; }
    setSearching(true);
    const res = await searchLocations(q);
    setResults(res);
    setSearching(false);
  };

  const handleAdd = (loc) => {
    setSaved(addSavedLocation(loc));
    setQuery("");
    setResults([]);
  };

  const handleRemove = (id) => setSaved(removeSavedLocation(id));

  const handleSelect = (loc) => {
    setStoredLocation(loc);
    navigate("/Radar");
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background pb-24 text-foreground">
      <AppHeader title="Locations" />

      <div className="mx-auto max-w-md space-y-4 px-4 pt-4">
        <div>
          <h1 className="text-xl font-bold">Saved Places</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Quickly switch between cities. Tap a place to use it as your active location.
          </p>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => doSearch(e.target.value)}
            placeholder="Search city, town, or zip…"
            className="w-full rounded-xl border border-border/60 bg-secondary/40 pl-9 pr-3 py-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
          />
        </div>

        {results.length > 0 && (
          <div className="overflow-hidden rounded-2xl border border-border/60 bg-card/60">
            {results.map((r, i) => (
              <button
                key={`${r.label}-${i}`}
                onClick={() => handleAdd(r)}
                className="flex w-full items-center gap-3 border-b border-border/40 px-4 py-3 text-left last:border-0 hover:bg-secondary/40"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <div className="flex-1 text-sm">{r.label}</div>
                <Plus className="h-4 w-4 text-muted-foreground" />
              </button>
            ))}
          </div>
        )}

        {searching && <div className="text-xs text-muted-foreground">Searching…</div>}

        <div className="space-y-2">
          <div className="px-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Saved ({saved.length})
          </div>
          {saved.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/30 px-4 py-10 text-center">
              <Star className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No saved locations yet.</p>
              <p className="mt-1 text-xs text-muted-foreground/70">Search above to add a city.</p>
            </div>
          ) : (
            saved.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card/60 px-4 py-3"
              >
                <button onClick={() => handleSelect(loc)} className="flex flex-1 items-center gap-3 text-left">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/25">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold">{loc.label}</div>
                    <div className="text-xs text-muted-foreground tabular-nums">
                      {loc.latitude.toFixed(2)}, {loc.longitude.toFixed(2)}
                    </div>
                  </div>
                  <Check className="h-4 w-4 text-muted-foreground" />
                </button>
                <button
                  onClick={() => handleRemove(loc.id)}
                  aria-label={`Remove ${loc.label}`}
                  className="flex h-9 w-9 items-center justify-center rounded-xl border border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-950/60"
                  style={{ minHeight: "auto" }}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}