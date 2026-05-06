import { useState, useEffect, useRef } from "react";
import { Search, X, MapPin, Loader2 } from "lucide-react";
import { searchLocations } from "@/lib/weather/savedLocations";
import { setStoredLocation } from "@/lib/weather/locationUtils";

export default function LocationSearchBar({ onPick }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) { setResults([]); return; }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const r = await searchLocations(query.trim());
        setResults(r);
      } finally { setLoading(false); }
    }, 350);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  const handlePick = (r) => {
    const loc = { latitude: r.latitude, longitude: r.longitude, label: r.label };
    setStoredLocation(loc);
    setQuery("");
    setOpen(false);
    onPick?.(loc);
    window.location.reload();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search city, ZIP, or place"
          className="w-full rounded-xl border border-border/60 bg-secondary/60 pl-9 pr-9 py-2 text-sm outline-none placeholder:text-muted-foreground focus:border-primary/60"
          style={{ minHeight: "40px" }}
        />
        {query && (
          <button
            onClick={() => { setQuery(""); setResults([]); }}
            aria-label="Clear"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 hover:bg-secondary"
            style={{ minHeight: "auto" }}
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </button>
        )}
      </div>

      {open && query.trim() && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-64 overflow-y-auto rounded-xl border border-border/60 glass-strong shadow-xl">
          {loading ? (
            <div className="flex items-center gap-2 px-3 py-3 text-xs text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching…
            </div>
          ) : results.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted-foreground">No matches.</div>
          ) : (
            results.map((r) => (
              <button
                key={r.id}
                onClick={() => handlePick(r)}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm hover:bg-secondary/60"
              >
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate">{r.label}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}