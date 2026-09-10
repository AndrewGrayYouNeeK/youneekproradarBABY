import { useState } from "react";
import { MapPin, Plus, Search, X } from "lucide-react";
import { searchPlaces } from "@/lib/api/liveHazards";

export default function LocationPicker({ coords, locations, onSelect, onUseGps, onAdd, onRemove }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const handleSearch = async (event) => {
    event.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    try {
      const places = await searchPlaces(query.trim());
      setResults(places);
    } finally {
      setSearching(false);
    }
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Location</div>
          <div className="mt-1 flex items-center gap-1.5 text-sm text-white">
            <MapPin className="h-3.5 w-3.5 text-sky-300" />
            {coords?.label || "Locating…"}
          </div>
        </div>
        <button
          type="button"
          onClick={onUseGps}
          className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-[11px] font-semibold text-sky-200"
        >
          Use GPS
        </button>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search cities or addresses"
            className="h-11 w-full rounded-2xl border border-white/10 bg-white/5 pl-9 pr-3 text-sm text-white placeholder:text-slate-500"
          />
        </div>
        <button type="submit" className="rounded-2xl bg-sky-400 px-4 text-sm font-semibold text-slate-950">
          {searching ? "…" : "Go"}
        </button>
      </form>

      {results.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-950">
          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => {
                onAdd(place);
                setResults([]);
                setQuery("");
              }}
              className="flex w-full items-center justify-between gap-2 border-b border-white/5 px-4 py-3 text-left last:border-b-0"
            >
              <span className="text-sm text-white">{place.name}</span>
              <Plus className="h-4 w-4 text-sky-300" />
            </button>
          ))}
        </div>
      )}

      {locations.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {locations.map((place) => (
            <div
              key={place.id}
              className={`flex shrink-0 items-center gap-1 rounded-full border px-3 py-2 text-xs ${
                coords?.source === "saved" && coords.label === place.name
                  ? "border-sky-400/40 bg-sky-400/10 text-sky-100"
                  : "border-white/10 bg-white/5 text-slate-200"
              }`}
            >
              <button type="button" onClick={() => onSelect(place)}>
                {place.name.split(",")[0]}
              </button>
              <button type="button" onClick={() => onRemove(place.id)} aria-label={`Remove ${place.name}`}>
                <X className="h-3.5 w-3.5 text-slate-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
