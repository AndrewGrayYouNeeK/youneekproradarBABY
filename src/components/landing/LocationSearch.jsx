import { useState } from "react";
import { searchPlaces } from "@/lib/landing/nws";

export default function LocationSearch({ onSelect, onUseMine, locationNote }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");

  const runSearch = async (event) => {
    event.preventDefault();
    const name = query.trim();
    if (name.length < 2) return;
    setStatus("Searching…");
    try {
      const places = await searchPlaces(name);
      setResults(places);
      setStatus(places.length ? "" : "No matches. Try a city name.");
    } catch {
      setResults([]);
      setStatus("City search is unavailable.");
    }
  };

  return (
    <div className="mt-4">
      {locationNote ? <p className="mb-2 text-xs text-[#ffd400]">{locationNote} Search for a city instead.</p> : null}
      <form onSubmit={runSearch} className="flex gap-2">
        <label className="sr-only" htmlFor="city-search">
          Search city
        </label>
        <input
          id="city-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search a city"
          className="min-h-11 flex-1 border border-white/20 bg-black/70 px-3 text-sm text-white placeholder:text-white/40"
        />
        <button type="submit" className="min-h-11 border border-[#00ff9c]/50 px-3 text-xs font-bold uppercase tracking-[0.16em] text-[#00ff9c]">
          Search
        </button>
      </form>
      {status ? <p className="mt-2 text-xs text-white/70">{status}</p> : null}
      {results.length > 0 ? (
        <ul className="mt-2 border border-white/15 bg-black/80">
          {results.map((place) => (
            <li key={place.id}>
              <button
                type="button"
                className="min-h-11 w-full px-3 text-left text-sm hover:bg-white/10"
                onClick={() => {
                  onSelect(place);
                  setResults([]);
                  setStatus(place.label);
                }}
              >
                {place.label}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <button type="button" onClick={onUseMine} className="mt-2 text-xs uppercase tracking-[0.16em] text-white/70 underline">
        Use my location
      </button>
    </div>
  );
}
